--======================== Citizen Work flow ==================================


CREATE OR REPLACE PROCEDURE sp_create_citizen_user(
    p_user_name VARCHAR,
    p_gender VARCHAR,
    p_mobile VARCHAR,
    p_district VARCHAR,
    p_email VARCHAR,
    p_login_id VARCHAR,
    p_password_hash TEXT DEFAULT NULL
)


/* 
CALL sp_create_citizen_user(
    'Ramesh',  -- Name
    'Male',          -- Gender
    '9142536968',    -- Mobile
    'Chennai',       -- District
    'ramesh@example.com',  -- Email
    NULL,            -- Login ID (optional)
    'Protectedpassword'             -- Password hash (optional)
);*/

--Details capturing by mobile:
CREATE OR REPLACE FUNCTION fn_user_details_by_mobile(p_mobile VARCHAR)

/*RETURNS TABLE (
    user_id BIGINT,
    user_name VARCHAR,
    email VARCHAR,
    mobile VARCHAR,
    login_id VARCHAR,
    password_hash TEXT,
    role_id INT,
    district VARCHAR
) */

--District_list:
CREATE OR REPLACE FUNCTION fn_district_list()
RETURNS TABLE (id integer, district VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT d.district_id, d.district_name 
    FROM district_master_tb d;
END;
$$;

--Taluk List:
CREATE OR REPLACE FUNCTION fn_taluk_list(p_district_id integer)
RETURNS TABLE (id integer, district VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.taluk_id, t.taluk_name 
    FROM taluk_master_tb t
	WHERE t.district_id = p_district_id;
END;
$$;

--SELECT * FROM fn_taluk_list(1);

CREATE OR REPLACE FUNCTION fn_issue_type()
RETURNS TABLE (id integer, issue_name VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.issue_id, i.Issue_name 
    FROM issue_master_tb i;
END;
$$;

--SELECT * FROM fn_issue_type();

CREATE OR REPLACE FUNCTION fn_issue_category(p_issue_id integer, p_role_id Integer)
RETURNS TABLE (id integer, issue_name VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.category_id, i.category_name 
    FROM issue_category_tb i
	WHERE i.Issue_id = p_issue_id
	AND i.role_id = p_role_id
	ORDER BY i.category_name ASC;
END;
$$;

--SELECT * FROM fn_issue_category(1,1)



CREATE FUNCTION fn_issue_subcategory(p_category_id integer, p_role_id Integer)
RETURNS TABLE (id integer, issue_name VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT i.subcategory_id, i.subcategory_name 
    FROM issue_subcategory_tb i
	WHERE i.category_id = p_category_id
	AND i.role_id = p_role_id
	ORDER BY i.subcategory_name ASC;
END;
$$;

--SELECT * FROM fn_issue_subcategory(9,1)




-- Citizen Raise Ticket:
--With attachments:

CALL sp_citizen_create_ticket(
    'Ramesh', '9876543210', 'ramesh@example.com',
    5, 12, 1, 9, 43,
    'High', 'Street light not working',
    1,
    '[{"file_name":"photo1.jpg","file_path":"/uploads/photo1.jpg","mime_type":"image/jpeg"},
      {"file_name":"proof.pdf","file_path":"/uploads/proof.pdf","mime_type":"application/pdf"}]'::jsonb
);

--Without attachments:

CALL sp_citizen_create_ticket(
    'Ramesh', '9876543210', 'ramesh@example.com',
    5, 12, 1, 9, 43,
    'High', 'Street light not working',
    1
);


--=================Dashbord
--Total, In_progress, Returned, Resolved, Reopened, Closed  Tickets Count:
CREATE OR REPLACE FUNCTION fn_dashboard_ticket_counts(p_user_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'Total',        COUNT(*),
        'In_progress',  COALESCE(SUM(CASE WHEN current_status = 'New' THEN 1 ELSE 0 END), 0),
        'Returned',     COALESCE(SUM(CASE WHEN current_status = 'Returned' THEN 1 ELSE 0 END), 0),
        'Resolved',     COALESCE(SUM(CASE WHEN current_status = 'Resolved' THEN 1 ELSE 0 END), 0),
        'Reopened',     COALESCE(SUM(CASE WHEN current_status = 'Reopened' THEN 1 ELSE 0 END), 0),
        'Closed',       COALESCE(SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END), 0)
    )
    INTO v_result
    FROM (
        -- Citizen
        SELECT current_status FROM citizen_grievance_tb WHERE created_by = p_user_id
        UNION ALL
        -- CM Helpline
        SELECT current_status FROM cm_helpline_grievance_tb WHERE created_by = p_user_id
        UNION ALL
        -- Department
        SELECT current_status FROM department_grievance_tb WHERE created_by = p_user_id
        UNION ALL
        -- EDM
        SELECT current_status FROM edm_grievance_tb WHERE created_by = p_user_id
        UNION ALL
        -- Operator
        SELECT current_status FROM operator_grievance_tb WHERE created_by = p_user_id
    ) AS all_tickets;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

--SELECT * FROM fn_dashboard_ticket_counts(1);

-- Recent Activities of all users:
CREATE OR REPLACE FUNCTION fn_dashboard_activities_list(p_user_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(data) INTO v_result
    FROM (
        SELECT *
        FROM (
            -- Citizen Grievance
            SELECT 
                u.user_id,
                'Citizen' AS type_of_user,
                u.user_name AS name,
                u.mobile,
                u.district,
                c.created_dttm,
                i.issue_name AS issue_type,
                ic.category_name AS issue_category,
                isc.subcategory_name AS issue_subcategory,
                c.ticket_id,
                c.current_status AS status
            FROM citizen_grievance_tb c
            LEFT JOIN issue_master_tb i ON i.issue_id = c.issue_id
            LEFT JOIN issue_category_tb ic ON ic.category_id = c.category_id
            LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = c.subcategory_id
            LEFT JOIN user_master u ON u.user_id = c.created_by
            WHERE c.created_by = p_user_id
            
            UNION ALL
            
            -- CM Helpline Grievance
            SELECT 
                u.user_id,
                'CM Helpline' AS type_of_user,
                u.user_name AS name,
                u.mobile,
                u.district,
                cm.created_dttm,
                i.issue_name AS issue_type,
                ic.category_name AS issue_category,
                isc.subcategory_name AS issue_subcategory,
                cm.ticket_id,
                cm.current_status AS status
            FROM cm_helpline_grievance_tb cm
            LEFT JOIN issue_master_tb i ON i.issue_id = cm.issue_id
            LEFT JOIN issue_category_tb ic ON ic.category_id = cm.category_id
            LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = cm.subcategory_id
            LEFT JOIN user_master u ON u.user_id = cm.created_by
            WHERE cm.created_by = p_user_id
            
            UNION ALL
            
            -- Department Grievance
            SELECT 
                u.user_id,
                'Department' AS type_of_user,
                u.user_name AS name,
                u.mobile,
                u.district,
                d.created_dttm,
                i.issue_name AS issue_type,
                ic.category_name AS issue_category,
                isc.subcategory_name AS issue_subcategory,
                d.ticket_id,
                d.current_status AS status
            FROM department_grievance_tb d
            LEFT JOIN issue_master_tb i ON i.issue_id = d.issue_id
            LEFT JOIN issue_category_tb ic ON ic.category_id = d.category_id
            LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = d.subcategory_id
            LEFT JOIN user_master u ON u.user_id = d.created_by
            WHERE d.created_by = p_user_id
            
            UNION ALL
            
            -- EDM Grievance
            SELECT 
                u.user_id,
                'EDM' AS type_of_user,
                u.user_name AS name,
                u.mobile,
                u.district,
                e.created_dttm,
                i.issue_name AS issue_type,
                ic.category_name AS issue_category,
                isc.subcategory_name AS issue_subcategory,
                e.ticket_id,
                e.current_status AS status
            FROM edm_grievance_tb e
            LEFT JOIN issue_master_tb i ON i.issue_id = e.issue_id
            LEFT JOIN issue_category_tb ic ON ic.category_id = e.category_id
            LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = e.subcategory_id
            LEFT JOIN user_master u ON u.user_id = e.created_by
            WHERE e.created_by = p_user_id
            
            UNION ALL
            
            -- Operator Grievance
            SELECT 
                u.user_id,
                'Operator' AS type_of_user,
                u.user_name AS name,
                u.mobile,
                u.district,
                o.created_dttm,
                i.issue_name AS issue_type,
                ic.category_name AS issue_category,
                isc.subcategory_name AS issue_subcategory,
                o.ticket_id,
                o.current_status AS status
            FROM operator_grievance_tb o
            LEFT JOIN issue_master_tb i ON i.issue_id = o.issue_id
            LEFT JOIN issue_category_tb ic ON ic.category_id = o.category_id
            LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = o.subcategory_id
            LEFT JOIN user_master u ON u.user_id = o.created_by
            WHERE o.created_by = p_user_id
        ) AS all_data
        ORDER BY created_dttm DESC
    ) AS data;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

--SELECT * FROM fn_dashboard_activities_list(1);	


-- View Requests:
CREATE OR REPLACE FUNCTION sp_view_requests(
    p_user_id   INTEGER,
    p_ticket_id VARCHAR DEFAULT NULL,
    p_status    VARCHAR DEFAULT NULL,
    p_date      DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(row_data)
    INTO v_result
    FROM (
        -- 1. Citizen Tickets
        SELECT jsonb_build_object(
            'Module', 'Citizen',
            'UserId', u.user_id,
            'TypeOfUser', r.role_name,
            'Name', u.user_name,
            'Mobile', u.mobile,
            'District', d.district_name,
            'Taluk', t.taluk_name,
            'CreatedDate', TO_CHAR(cg.created_dttm, 'DD-MM-YYYY HH24:MI'),
            'IssueType', i.issue_name,
            'Category', ic.category_name,
            'Subcategory', isc.subcategory_name,
            'TicketId', cg.ticket_id,
            'Remarks', cg.description,
            'Attachments', (
                SELECT jsonb_agg(jsonb_build_object(
                    'FileName', ta.file_name,
                    'FilePath', ta.file_path
                ))
                FROM ticket_attachment_tb ta WHERE ta.ticket_id = cg.ticket_id
            ),
            'HelpdeskNotes', h.action_notes,
            'Status', cg.current_status,
            'Action', 'View'
        ) AS row_data
        FROM citizen_grievance_tb cg
        LEFT JOIN district_master_tb d ON d.district_id = cg.district_id
        LEFT JOIN taluk_master_tb t ON t.taluk_id = cg.taluk_id
        LEFT JOIN issue_master_tb i ON i.issue_id = cg.issue_id
        LEFT JOIN issue_category_tb ic ON ic.category_id = cg.category_id
        LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = cg.subcategory_id
        LEFT JOIN user_master u ON u.user_id = cg.created_by
        LEFT JOIN role_master_tb r ON r.role_id = u.role_id
        LEFT JOIN citizen_ticket_flow_history_tb h ON h.ticket_id = cg.ticket_id AND h.end_time IS NULL
        WHERE cg.created_by = p_user_id
          AND (cg.ticket_id = p_ticket_id OR p_ticket_id IS NULL)
          AND (cg.current_status = p_status OR p_status IS NULL)
          AND (p_date IS NULL OR DATE(cg.created_dttm) = p_date)

        UNION ALL

        -- 2. CM Helpline Tickets
        SELECT jsonb_build_object(
            'Module', 'CM Helpline',
            'UserId', u.user_id,
            'TypeOfUser', r.role_name,
            'Name', u.user_name,
            'Mobile', u.mobile,
            'District', d.district_name,
            'Taluk', t.taluk_name,
            'CreatedDate', TO_CHAR(chg.created_dttm, 'DD-MM-YYYY HH24:MI'),
            'IssueType', i.issue_name,
            'Category', ic.category_name,
            'Subcategory', isc.subcategory_name,
            'TicketId', chg.ticket_id,
            'Remarks', chg.description,
            'Attachments', (
                SELECT jsonb_agg(jsonb_build_object(
                    'FileName', ta.file_name,
                    'FilePath', ta.file_path
                ))
                FROM ticket_attachment_tb ta WHERE ta.ticket_id = chg.ticket_id
            ),
            'HelpdeskNotes', h.action_notes,
            'Status', chg.current_status,
            'Action', 'View'
        )
        FROM cm_helpline_grievance_tb chg
        LEFT JOIN district_master_tb d ON d.district_id = chg.district_id
        LEFT JOIN taluk_master_tb t ON t.taluk_id = chg.taluk_id
        LEFT JOIN issue_master_tb i ON i.issue_id = chg.issue_id
        LEFT JOIN issue_category_tb ic ON ic.category_id = chg.category_id
        LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = chg.subcategory_id
        LEFT JOIN user_master u ON u.user_id = chg.created_by
        LEFT JOIN role_master_tb r ON r.role_id = u.role_id
        LEFT JOIN cm_helpline_ticket_flow_history_tb h ON h.ticket_id = chg.ticket_id AND h.end_time IS NULL
        WHERE chg.created_by = p_user_id
          AND (chg.ticket_id = p_ticket_id OR p_ticket_id IS NULL)
          AND (chg.current_status = p_status OR p_status IS NULL)
          AND (p_date IS NULL OR DATE(chg.created_dttm) = p_date)

        UNION ALL

        -- 3. Department Tickets
        SELECT jsonb_build_object(
            'Module', 'Department',
            'UserId', u.user_id,
            'TypeOfUser', r.role_name,
            'Name', u.user_name,
            'Mobile', u.mobile,
            'District', d.district_name,
            'Taluk', t.taluk_name,
            'CreatedDate', TO_CHAR(dg.created_dttm, 'DD-MM-YYYY HH24:MI'),
            'IssueType', i.issue_name,
            'Category', ic.category_name,
            'Subcategory', isc.subcategory_name,
            'TicketId', dg.ticket_id,
            'Remarks', dg.description,
            'Attachments', (
                SELECT jsonb_agg(jsonb_build_object(
                    'FileName', ta.file_name,
                    'FilePath', ta.file_path
                ))
                FROM ticket_attachment_tb ta WHERE ta.ticket_id = dg.ticket_id
            ),
            'HelpdeskNotes', h.action_notes,
            'Status', dg.current_status,
            'Action', 'View'
        )
        FROM department_grievance_tb dg
        LEFT JOIN district_master_tb d ON d.district_id = dg.district_id
        LEFT JOIN taluk_master_tb t ON t.taluk_id = dg.taluk_id
        LEFT JOIN issue_master_tb i ON i.issue_id = dg.issue_id
        LEFT JOIN issue_category_tb ic ON ic.category_id = dg.category_id
        LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = dg.subcategory_id
        LEFT JOIN user_master u ON u.user_id = dg.created_by
        LEFT JOIN role_master_tb r ON r.role_id = u.role_id
        LEFT JOIN department_ticket_flow_history_tb h ON h.ticket_id = dg.ticket_id AND h.end_time IS NULL
        WHERE dg.created_by = p_user_id
          AND (dg.ticket_id = p_ticket_id OR p_ticket_id IS NULL)
          AND (dg.current_status = p_status OR p_status IS NULL)
          AND (p_date IS NULL OR DATE(dg.created_dttm) = p_date)

        UNION ALL

        -- 4. EDM Tickets
        SELECT jsonb_build_object(
            'Module', 'EDM',
            'UserId', u.user_id,
            'TypeOfUser', r.role_name,
            'Name', u.user_name,
            'Mobile', u.mobile,
            'District', d.district_name,
            'Taluk', t.taluk_name,
            'CreatedDate', TO_CHAR(eg.created_dttm, 'DD-MM-YYYY HH24:MI'),
            'IssueType', i.issue_name,
            'Category', ic.category_name,
            'Subcategory', isc.subcategory_name,
            'TicketId', eg.ticket_id,
            'Remarks', eg.description,
            'Attachments', (
                SELECT jsonb_agg(jsonb_build_object(
                    'FileName', ta.file_name,
                    'FilePath', ta.file_path
                ))
                FROM ticket_attachment_tb ta WHERE ta.ticket_id = eg.ticket_id
            ),
            'HelpdeskNotes', h.action_notes,
            'Status', eg.current_status,
            'Action', 'View'
        )
        FROM edm_grievance_tb eg
        LEFT JOIN district_master_tb d ON d.district_id = eg.district_id
        LEFT JOIN taluk_master_tb t ON t.taluk_id = eg.taluk_id
        LEFT JOIN issue_master_tb i ON i.issue_id = eg.issue_id
        LEFT JOIN issue_category_tb ic ON ic.category_id = eg.category_id
        LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = eg.subcategory_id
        LEFT JOIN user_master u ON u.user_id = eg.created_by
        LEFT JOIN role_master_tb r ON r.role_id = u.role_id
        LEFT JOIN edm_ticket_flow_history_tb h ON h.ticket_id = eg.ticket_id AND h.end_time IS NULL
        WHERE eg.created_by = p_user_id
          AND (eg.ticket_id = p_ticket_id OR p_ticket_id IS NULL)
          AND (eg.current_status = p_status OR p_status IS NULL)
          AND (p_date IS NULL OR DATE(eg.created_dttm) = p_date)

        UNION ALL

        -- 5. Operator Tickets
        SELECT jsonb_build_object(
            'Module', 'Operator',
            'UserId', u.user_id,
            'TypeOfUser', r.role_name,
            'Name', u.user_name,
            'Mobile', u.mobile,
            'District', d.district_name,
            'Taluk', t.taluk_name,
            'CreatedDate', TO_CHAR(og.created_dttm, 'DD-MM-YYYY HH24:MI'),
            'IssueType', i.issue_name,
            'Category', ic.category_name,
            'Subcategory', isc.subcategory_name,
            'TicketId', og.ticket_id,
            'Remarks', og.description,
            'Attachments', (
                SELECT jsonb_agg(jsonb_build_object(
                    'FileName', ta.file_name,
                    'FilePath', ta.file_path
                ))
                FROM ticket_attachment_tb ta WHERE ta.ticket_id = og.ticket_id
            ),
            'HelpdeskNotes', h.action_notes,
            'Status', og.current_status,
            'Action', 'View'
        )
        FROM operator_grievance_tb og
        LEFT JOIN district_master_tb d ON d.district_id = og.district_id
        LEFT JOIN taluk_master_tb t ON t.taluk_id = og.taluk_id
        LEFT JOIN issue_master_tb i ON i.issue_id = og.issue_id
        LEFT JOIN issue_category_tb ic ON ic.category_id = og.category_id
        LEFT JOIN issue_subcategory_tb isc ON isc.subcategory_id = og.subcategory_id
        LEFT JOIN user_master u ON u.user_id = og.created_by
        LEFT JOIN role_master_tb r ON r.role_id = u.role_id
        LEFT JOIN operator_ticket_flow_history_tb h ON h.ticket_id = og.ticket_id AND h.end_time IS NULL
        WHERE og.created_by = p_user_id
          AND (og.ticket_id = p_ticket_id OR p_ticket_id IS NULL)
          AND (og.current_status = p_status OR p_status IS NULL)
          AND (p_date IS NULL OR DATE(og.created_dttm) = p_date)
    ) sub;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;


-- SELECT * FROM sp_view_requests(1, null, null, null)



--======================================== Operator / edm 

--Dashboard:
CREATE OR REPLACE FUNCTION public.fn_opredm_dashboard_counts(p_user_id integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
    v_role_id integer;
    v_role_name text;
BEGIN
    -- Get the user's role
    SELECT role_id INTO v_role_id FROM user_master WHERE user_id = p_user_id;
    SELECT role_name INTO v_role_name FROM role_master_tb WHERE role_id = v_role_id;

    -- eDM Dashboard
    IF v_role_name = 'eDM' THEN
        SELECT jsonb_build_object(
            'Role', 'eDM',
            'Self', jsonb_build_object(
                'Total', COUNT(*),
                'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
            ),
            'OnBehalf', (
                SELECT jsonb_build_object(
                    'Total', COUNT(*),
                    'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                    'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                    'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
                )
                FROM edm_grievance_tb
                WHERE created_by = p_user_id
                  AND raised_for_department_user_id IS NOT NULL
            ),
            'Overall', (
                SELECT jsonb_build_object(
                    'Total', COUNT(*),
                    'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                    'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                    'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
                )
                FROM edm_grievance_tb
                WHERE created_by = p_user_id
            )
        )
        INTO v_result
        FROM edm_grievance_tb
        WHERE created_by = p_user_id
          AND raised_for_department_user_id IS NULL;

    -- Operator Dashboard
    ELSIF v_role_name = 'eSevai Operator' THEN
        SELECT jsonb_build_object(
            'Role', 'eSevai Operator',
            'Self', jsonb_build_object(
                'Total', COUNT(*),
                'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
            ),
            'OnBehalf', (
                SELECT jsonb_build_object(
                    'Total', COUNT(*),
                    'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                    'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                    'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
                )
                FROM operator_grievance_tb
                WHERE created_by = p_user_id
                  AND raised_for_citizen_mobile IS NOT NULL
            ),
            'Overall', (
                SELECT jsonb_build_object(
                    'Total', COUNT(*),
                    'Open', SUM(CASE WHEN current_status = 'Open' THEN 1 ELSE 0 END),
                    'InProgress', SUM(CASE WHEN current_status = 'In-Progress' THEN 1 ELSE 0 END),
                    'Closed', SUM(CASE WHEN current_status = 'Closed' THEN 1 ELSE 0 END)
                )
                FROM operator_grievance_tb
                WHERE created_by = p_user_id
            )
        )
        INTO v_result
        FROM operator_grievance_tb
        WHERE created_by = p_user_id
          AND raised_for_citizen_mobile IS NULL;

    ELSE
        v_result := jsonb_build_object('Message', 'Role not supported for this dashboard');
    END IF;

    RETURN v_result;
END;
$$;

-- SELECT * FROM fn_opredm_dashboard_counts(15);
-- SELECT * FROM fn_opredm_dashboard_counts(14);