<script>
    $(document).ready(function () {
        const roleId = localStorage.getItem("role_id") || null;
    const MAX_FILE_DESC = 25;

    // Helper: safeVal as you had it
    function safeVal(val) {
          if (val === undefined || val === null) return null;
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
        }
    $(document).on("input", ".file-desc", function () {
          if (this.value.length > MAX_FILE_DESC) {
        this.value = this.value.slice(0, MAX_FILE_DESC);
          }
        });

    $(document).on("input", "#selfPane input[type='text'],input[type='email'], #selfPane textarea", function () {
          const forbidden = /[<>"'&/\\;`]/g;
        if (forbidden.test(this.value)) {
            this.value = this.value.replace(forbidden, ""); // remove forbidden chars immediately
        showErrorToast("Special characters < > \" ' & / \\ ; ` are not allowed.");
          }
        });


            function generateDynamicFields(columnsString, prefix, $container, fileInputClass) {
                $container.empty();

            if (!columnsString) {
                $container.append('<p>No additional fields required for this subcategory.</p>');
            return;
          }

            let fieldsArray = [];
            const trimmed = (columnsString || '').trim();

            try {
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              fieldsArray = JSON.parse(trimmed);
            } else {
              const columnsArray = columnsString.split(',');
              fieldsArray = columnsArray.map((c) => ({legacy_code: c.trim() }));
            }
          } catch (err) {
                console.error("Failed to parse columnsString:", err, columnsString);
            $container.append('<p class="text-danger">Error loading dynamic fields.</p>');
            return;
          }

          fieldsArray.forEach((f, index) => {
            // LEGACY
            if (f.legacy_code) {
              // const col = f.legacy_code;
              const field = fieldMap && fieldMap[col];
            if (!field) return;

            const inputId = `field_${prefix}_${col}_${index}`;
            const isMandatory = String(col).endsWith('man');
            const mandatoryAttr = isMandatory ? 'data-mandatory="true"' : '';
              // const dataParamAttr = `data-param="p${col}"`;
              // const dataColAttr = `data-col="${col}"`;


            const col = f.legacy_code || f.column_id || index + 1; // fallback numeric index
            const key = col ? `p${col}` : `pfield_${index}`;        // fallback unique key
            const dataParamAttr = `data-param="${key}"`;
            const dataColAttr = `data-col="${col}"`;

            if (col === "4opt" || col === "4man") {
                const wrapperId = `wrapper_${inputId}`;
            const html = `
            <div id="${wrapperId}" class="mb-3 file-wrapper" ${dataColAttr} ${dataParamAttr}>
                <label class="form-label">${field.label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>

                <div class="row fw-bold border-bottom pb-2 mb-2">
                    <div class="col-md-1">S No</div>
                    <div class="col-md-4">Attachment Description</div>
                    <div class="col-md-4">Attachment <small class="text-muted text-danger">(max 2MB each)</small></div>
                    <div class="col-md-3">Actions</div>
                </div>

                <div class="file-rows">
                    <div class="file-row row align-items-center1 mb-2">
                        <div class="col-md-1"><span class="fw-bold file-label">1</span></div>
                        <div class="col-md-4">
                            <input type="text" maxlength="${MAX_FILE_DESC}" class="form-control file-desc" data-param="p${col}_desc" data-col="${col}" placeholder="Enter document description">
                        </div>
                        <div class="col-md-4">
                            <input type="file" class="form-control ${fileInputClass}" accept=".jpg,.jpeg,.png,.pdf">
                                <small class="text-danger">jpg, jpeg, png, pdf only allowed</small>
                        </div>
                        <div class="col-md-3"><button type="button" class="btn btn-danger btn-sm btn-delete-file">Delete</button></div>
                    </div>
                </div>

                <div class="mt-2"><button type="button" class="btn btn-primary btn-sm btn-add-file" disabled>Add More</button></div>
            </div>
            `;
            $container.append(html);
              } else {
                // normal legacy field (attach data-param)
                let fieldHtml = '';
            if (col === "9man") {
                fieldHtml = `
            <div class="mb-3">
              <label for="${inputId}">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
              <select id="${inputId}" class="form-select" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}>
                <option value="">-- Select --</option>
                <option value="ID blocked due to Zero transactions">ID blocked due to Zero transactions</option>
                <option value="ID blocked due to overcharging issues">ID blocked due to overcharging issues</option>
                <option value="Don’t know">Don’t know</option>
              </select>
            </div>`;
                } else if (field.type === "textarea") {
                fieldHtml = `
            <div class="mb-3">
              <label for="${inputId}">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
              <textarea id="${inputId}" class="form-control" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}></textarea>
            </div>`;
                } else {
                fieldHtml = `
            <div class="mb-3">
              <label for="${inputId}">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
              <input id="${inputId}" type="${field.type || 'text'}" class="form-control" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}>
            </div>`;
                }
            $container.append(fieldHtml);
              }

            return;
            }

            // NEW API mode
            const isMandatory = (f.manopt && f.manopt.toLowerCase() === "mandatory");
            const colId = f.column_id;
            const label = f.column_name || (`Field ${colId}`);
            const typeRaw = (f.field_type || '').toLowerCase();
            const inputId = `field_${prefix}_${colId}`;
            const dataParamAttr = `data-param="p${colId}"`;
            const dataColAttr = `data-col="${colId}"`;
            const mandatoryAttr = isMandatory ? 'data-mandatory="true"' : '';

            if (typeRaw === "attachment") {
              const wrapperId = `wrapper_${inputId}`;
            const html = `
            <div id="${wrapperId}" class="mb-3 file-wrapper" ${dataColAttr} ${mandatoryAttr} data-param="p${colId}">
                <label class="form-label">${label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>
                <div class="row fw-bold border-bottom pb-2 mb-2">
                    <div class="col-md-1">S No</div>
                    <div class="col-md-4">Attachment Description</div>
                    <div class="col-md-4">Attachment <small class="text-muted text-danger">(max 2MB each)</small></div>
                    <div class="col-md-3">Actions</div>
                </div>

                <div class="file-rows">
                    <div class="file-row row align-items-center1 mb-2">
                        <div class="col-md-1"><span class="fw-bold file-label">1</span></div>
                        <div class="col-md-4">
                            <input type="text" maxlength="${MAX_FILE_DESC}" class="form-control file-desc" data-param="p${colId}_desc" data-col="${col}_desc" placeholder="Enter document description">
                        </div>
                        <div class="col-md-4">
                            <input type="file" class="form-control ${fileInputClass}" accept=".jpg,.jpeg,.png,.pdf">
                                <small class="text-danger">jpg, jpeg, png, pdf only allowed</small>
                        </div>
                        <div class="col-md-3"><button type="button" class="btn btn-danger btn-sm btn-delete-file">Delete</button></div>
                    </div>
                </div>

                <div class="mt-2"><button type="button" class="btn btn-primary btn-sm btn-add-file" disabled>Add More</button></div>
            </div>
            `;
            $container.append(html);
            return;
            }

            if (typeRaw === "checkbox") {
              const wrapper = $(`
            <div class="mb-3 dyn-checkbox-wrapper" ${dataColAttr} ${mandatoryAttr} data-param="p${colId}">
                <label>${label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>
            </div>
            `);

              (f.values || []).forEach(v => {
                wrapper.append(`
          <div class="form-check">
            <input class="form-check-input dyn-checkbox" type="checkbox" value="${v}" data-id="${colId}">
            <label class="form-check-label">${v}</label>
          </div>
        `);
              });

            $container.append(wrapper);
            return;
            }

            if (typeRaw === "dropdown") {
              const html = `
            <div class="mb-3">
                <label for="${inputId}">${label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>
                <select id="${inputId}" class="form-select dyn-field" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}>
                    <option value="">-- Select --</option>
                </select>
            </div>`;
            $container.append(html);

            const $select = $("#" + inputId);

            if (
            (f.column_name && f.column_name.toLowerCase().includes("district")) ||
            (f.options_source && String(f.options_source).toLowerCase() === "district")
            ) {
                const payload = {action: "function_call", function_name: "fn_district_list", params: { } };
            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: "POST",
            data: {data: encryptData(payload) },
            success(res) {
                    const decrypted = decryptData(res.data);
            let districtList = [];
            if (Array.isArray(decrypted)) districtList = decrypted;
            else if (decrypted[0] && decrypted[0].fn_district_list) districtList = decrypted[0].fn_district_list;
            $select.empty().append(`<option value="" class="placeholder">-- Select District --</option>`);
                    if (Array.isArray(districtList)) districtList.forEach(d => $select.append(`<option value="${d.id}">${d.district}</option>`));
                  },
            error() {$select.empty().append(`<option value="">District load failed</option>`); }
                });
              } else if (Array.isArray(f.values)) {
                f.values.forEach(v => $select.append(`<option value="${v}">${v}</option>`));
              }

            return;
            }

            if (typeRaw === "long text") {
              const html = `
            <div class="mb-3">
                <label for="${inputId}">${label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>
                <textarea id="${inputId}" class="form-control" rows="4" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}></textarea>
            </div>`;
            $container.append(html);
            return;
            }

            // fallback text
            const html = `
            <div class="mb-3">
                <label for="${inputId}">${label}${isMandatory ? ' <span class="text-danger">*</span>' : ''}</label>
                <input id="${inputId}" type="text" class="form-control" ${dataColAttr} ${dataParamAttr} ${mandatoryAttr}>
            </div>`;
            $container.append(html);
          });
        }

            async function processFilesInContainer($container, fileInputClass) {
          const filesArray = [];
            const manDescArray = [];
            const optDescArray = [];

            $container.find('.file-row').each(function () {
            const $row = $(this);
            const inputEl = $row.find(`input[type="file"].${fileInputClass}`)[0];
            if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;

            const desc = $row.find('.file-desc').val() || '';
            const $wrapper = $row.closest('.file-wrapper');
            const dataCol = $wrapper ? ($wrapper.attr('data-col') || '') : '';
            const mandatory = String(dataCol).endsWith('man');

            for (let i = 0; i < inputEl.files.length; i++) {
              const f = inputEl.files[i];
            filesArray.push({
                file_name: f.name,
            file_path: `/uploads/${f.name}`,
            mime_type: f.type,
            attachment_desc: desc,
            mandatory: mandatory,
            col: dataCol // crucial
              });
            }

            if (mandatory) manDescArray.push(desc);
            else optDescArray.push(desc);
          });

            return {filesArray, manDescArray, optDescArray};
        }

            // Unified pane initializer
            function initPane(opts) {
          const prefix = opts.prefix;
            const $type = $(opts.typeSelector);
            const $category = $(opts.categorySelector);
            const $subCat = $(opts.subCatSelector);
            const $dyn = $(opts.dynamicContainerSelector);
            const fileInputClass = opts.fileInputClass;
            const $submitBtn = $(opts.submitBtnSelector);

            // Load issue types into the pane's type select
            function loadIssueType() {
            const payload = {
                action: "function_call",
            function_name: "fn_issue_type",
            params: { }
            };
            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: "POST",
            data: {data: encryptData(payload) },
            dataType: "json",
            success(response) {
                const decrypted = decryptData(response.data);
            $type.empty().append('<option value="" class="placeholder">--Select Type--</option>');
                decrypted.forEach(item => {
                $type.append(`<option value="${item.id}">${item.issue_name}</option>`);
                });
              },
            error() {
                console.warn("Failed to load issue types for", prefix);
              }
            });
          }

            loadIssueType();

            // category depends on type
            $type.on('change', function () {
            const selectedType = $(this).val();
            const operatorPayload = {
                action: "function_call",
            function_name: "fn_issue_category",
            params: {type: selectedType || '', roleid: roleId }
            };
            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: 'POST',
            data: {data: encryptData(operatorPayload) },
            dataType: 'json',
            success(response) {
                const decrypted = decryptData(response.data);
            $category.empty().append('<option value="" class="placeholder">--Select Category--</option>');
                decrypted.forEach(item => {
                $category.append(`<option value="${item.id}">${item.issue_name}</option>`);
                });
              },
            error() {
                console.warn("Failed to load categories for", prefix);
              }
            });
          });

            // subcategory depends on category
            $category.on('change', function () {
            const selectedCategory = $(this).val();
            const operatorPayload = {
                action: "function_call",
            function_name: "fn_issue_subcategory",
            params: {type: selectedCategory || '', roleid: roleId }
            };
            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: 'POST',
            data: {data: encryptData(operatorPayload) },
            dataType: 'json',
            success(response) {
                const decrypted = decryptData(response.data);
            $subCat.empty().append('<option value="" class="placeholder">--Select Sub Category--</option>');
                decrypted.forEach(item => {
                  // store columns in attribute
                  // $subCat.append(`<option value="${item.id}" data-columns="${item.relavant_columns || ''}">${item.issue_name}</option>`);

                  // store columns in attribute (support legacy relavant_columns and new fn_relevant_columns)
                  const columnsAttr = item.relavant_columns
            ? item.relavant_columns
            : (item.fn_relevant_columns ? item.fn_relevant_columns : '');
            $subCat.append(`
            <option value="${item.id}" data-columns='${item.relevant_columns_data || ""}'>
                ${item.issue_name}
            </option>
            `);

                });
            // clear previous dynamic fields
            $dyn.empty();
              },
            error() {
                console.warn("Failed to load subcategories for", prefix);
              }
            });
          });

            $subCat.on('change', function () {
            const selectedOption = $(this).find('option:selected');
            const columnsData = selectedOption.attr('data-columns') || '';
            const subCatText = selectedOption.text().trim(); // subcategory label

            // clear dynamic fields every time
            $dyn.empty();

            // rebuild normal dynamic fields (if needed)
            generateDynamicFields(columnsData, prefix, $dyn, fileInputClass);

            // 🔹 custom requirement
            if (subCatText === "eService") {
                // open in new tab
                window.open("https://tnedistrict.tn.gov.in/tneda/", "_blank");
            $dyn.hide(); // optional
            $submitBtn.prop('disabled', true);
            }
            else if (subCatText === "Grievance") {
                $dyn.show();
            $submitBtn.prop('disabled', true);
            // build grievance UI fresh
            const trackingHtml = `
            <div id="ticketTracking" class="mt-3">
                <label for="ticketId">Enter Ticket ID:</label>
                <input type="text" id="ticketId" class="form-control mb-2" placeholder="Enter Ticket ID">
                    <button id="trackBtn" type="button" class="btn btn-primary btn-sm">Track Status</button>
            </div>
            `;
            $dyn.append(trackingHtml);

            $(document).off("click", "#trackBtn").on("click", "#trackBtn", function (e) {
                e.preventDefault(); // ⛔ stop form refresh

            const ticketId = $("#ticketId").val().trim();
            if (!ticketId) {
                alert("Please enter Ticket ID.");
            return;
                }

            const payload = {
                action: "function_call",
            function_name: "fn_get_ticket_details",
            params: {p_ticket_id: ticketId }
                };

            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: "POST",
            data: {data: encryptData(payload) },
            dataType: "json",
            success: function (res) {
                    const decrypted = decryptData(res.data);
            const raw = decrypted[0]?.fn_get_ticket_details;

            if (!raw) {
                alert("No ticket details found.");
            return;
                    }

            const details = JSON.parse(raw);

            // 1️⃣ Ticket Details
            // 1️⃣ Ticket Details
            const td = details.ticket_details;
            let detailsHtml = "";
            for (const [key, value] of Object.entries(td)) {
                let displayValue = value;

            // Format created_at or any other date field to date-only
            if (key.toLowerCase() === "created_at" && value) {
                        const dateObj = new Date(value);
            if (!isNaN(dateObj)) {
                displayValue = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                        }
                      }

            detailsHtml += `
            <tr>
                <th class="bg-light text-capitalize">${key.replace(/_/g, " ")}</th>
                <td>${displayValue || "N/A"}</td>
            </tr>`;
                    }
            $("#ticketDetailsTable").html(detailsHtml);


            // 2️⃣ Attachments
            const at = details.attachments || [];
            let attHtml = "";
                    at.forEach(f => {
                      const isImage = f.mime_type.startsWith("image/");
            const fileUrl = f.file_path;

            attHtml += `
            <li class="list-group-item">
                ${isImage
                    ? `<img src="${fileUrl}" alt="${f.file_name}" class="img-thumbnail me-2" style="max-height:80px">`
                    : `<i class="bi bi-file-earmark-pdf text-danger me-2"></i>`
                }
                <a href="${fileUrl}" target="_blank">${f.file_name}</a>
            </li>`;
                    });
            $("#ticketAttachments").html(attHtml);

            // 3️⃣ Timeline
            // 3️⃣ Timeline
            const tl = details.progress_timeline || [];
            let tlHtml = "";
                    tl.forEach(t => {
                let formattedDate = "";
            if (t.start_time) {
                        const dateObj = new Date(t.start_time);
            if (!isNaN(dateObj)) {
                formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                        }
                      }

            tlHtml += `
            <li>
                <div><strong>${t.role_name}</strong> → <em>${t.to_status}</em></div>
                <div class="small text-muted">${formattedDate}</div>
                <div>${t.notes || ""}</div>
            </li>`;
                    });
            $("#ticketTimeline").html(tlHtml);



            // 4️⃣ Show modal
            $("#ticketDetailsModal").modal("show");
                  },

            error: function () {
                alert("Failed to fetch ticket status.");
                  }
                });
              });
            }
            else {
                // enable submit button for all other subcategories
                $submitBtn.prop('disabled', false);
            }

          });


            $dyn.on('click', '.btn-add-file', function () {
            const $wrapper = $(this).closest(".file-wrapper");
            const $rowsContainer = $wrapper.find(".file-rows");
            const rowCount = $rowsContainer.find(".file-row").length + 1;

            if (rowCount > 3) {
                showErrorToast("Maximum 3 attachments allowed.");
            return;
            }

            const newRow = `
            <div class="file-row row align-items-center1 mb-2">
                <div class="col-md-1">
                    <span class="fw-bold file-label">${rowCount}</span>
                </div>
                <div class="col-md-4">
                    <input type="text" maxlength="${MAX_FILE_DESC}" class="form-control file-desc"
                        data-param="p${colId}_desc" data-col="${colId}"
                        placeholder="Enter document description">

                </div>
                <div class="col-md-4">
                    <input type="file" class="form-control ${fileInputClass}" accept=".jpg,.jpeg,.png,.pdf">
                        <small>jpg, jpeg, png, pdf only allowed</small>
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-danger btn-sm btn-delete-file">Delete</button>
                </div>
            </div>
            `;
            $rowsContainer.append(newRow);

            // Enable/disable Add button dynamically
            $(this).prop("disabled", true);
          });

            // Delete file row
            $dyn.on('click', '.btn-delete-file', function () {
            const $wrapper = $(this).closest(".file-wrapper");
            $(this).closest(".file-row").remove();

            // Renumber remaining rows
            $wrapper.find(".file-row").each(function (i) {
                $(this).find(".file-label").text(i + 1);
            });

            if ($wrapper.find(".file-row").length < 3) {
                $wrapper.find(".btn-add-file").prop("disabled", false);
            }
          });

            $dyn.on('change', `input[type="file"].${fileInputClass}`, function () {
            const fileInputEl = this;
            const file = fileInputEl.files[0];
            if (!file) return;

            const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
            const maxSize = 2 * 1024 * 1024;

            // references
            const $wrapper = $(fileInputEl).closest(".col-md-4");
            const $statusIcon = $wrapper.find(".upload-status-icon");
            const $smallNote = $wrapper.find("small");

            // reset state
            $statusIcon.removeClass("text-success text-danger").text("");
            $smallNote.show();

            if (!allowedTypes.includes(file.type)) {
                showErrorToast("Invalid file type! Only PDF, JPEG, and PNG files are allowed.");
            $(fileInputEl).val("");
            $statusIcon.text("✖").addClass("text-danger");
            $smallNote.show();
            return;
            }
            if (file.size > maxSize) {
                showErrorToast("File size exceeds 2MB limit!");
            $(fileInputEl).val("");
            $statusIcon.text("✖").addClass("text-danger");
            $smallNote.show();
            return;
            }

            const sessionId = localStorage.getItem("session_id") || "session_id_00000";
            const userId = localStorage.getItem("user_id");

            const tempPayload = {
                action: "function_call",
            function_name: "fn_temp_ticket_attachments",
            params: {
                p_session_id: userId,
            p_file_name: file.name,
            p_file_path: `/uploads/${file.name}`,
            p_mime_type: file.type,
            p_uploaded_by: userId
              }
            };

            const formData = new FormData();
            formData.append("data", encryptData(tempPayload));
            formData.append("file", file);

            $.ajax({
                url: `${BASE_API_URL}/commonfunction`,
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function (response) {
                const serverMsg = (response && response.message) ? response.message : "File uploaded successfully!";
            showSuccessToast(serverMsg);

            // ✅ remove old icon, then add tick ✔
            $(fileInputEl).next(".upload-status-icon").remove();
            $(fileInputEl).after(`<span class="upload-status-icon text-success ms-2">✔ ${serverMsg}</span>`);

                // ✅ hide the <small> note
                $(fileInputEl).siblings("small").hide();
                const $wrapper = $(fileInputEl).closest(".file-wrapper");
                $wrapper.find(".btn-add-file").prop("disabled", false);
              },
                error: function () {
                    showErrorToast("File upload failed!");

                $(fileInputEl).next(".upload-status-icon").remove();
                $(fileInputEl).after(`<span class="upload-status-icon text-danger ms-2">✖</span>`);

                $(fileInputEl).siblings("small").show();
              }
            });
          });

                $dyn.on('input change', 'input, textarea, select', function () {
            const $this = $(this);
                if ($this.data('mandatory') && $this.val().trim() === '') {
                    $this.addClass('is-invalid');
                $this.next('.error-msg').remove();
                $this.after('<span class="error-msg text-danger">This field is required</span>');
            } else {
                    $this.removeClass('is-invalid');
                $this.next('.error-msg').remove();
            }
          });

                $type.add($category).add($subCat).on('change', function () {
            const $el = $(this);
                if ($el.val() && $el.val().trim() !== '') {
                    $el.removeClass('is-invalid');
                $el.next('.error-msg').remove();
            }
          });

                function collectDynamicParams($container) {
            const params = { };
                $container.find("[data-param]").each(function () {
              const key = $(this).attr("data-param");
                if (!key) return;
                if ($(this).is("input, select, textarea")) {
                    params[key] = $(this).val() || "";
              }
            });
                return params;
          }

        } // end initPane

                $(document).on('click', '#successModal .download-pdf', function () {
          const {jsPDF} = window.jspdf;
                const card = document.getElementById('ackCard');
                if (!card) return;

          html2canvas(card).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pdfWidth - 20;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save("acknowledgement.pdf");
          });
        });


                // Initialize both panes
                initPane({
                    prefix: 'self',
                typeSelector: '#typeSelect',
                categorySelector: '#categorySelect',
                subCatSelector: '#subCategorySelect',
                dynamicContainerSelector: '#dynamicFieldsContainer',
                fileInputClass: 'file-input-self',
                submitBtnSelector: '#submitBtn'
        });

      }); // doc ready
            </script>