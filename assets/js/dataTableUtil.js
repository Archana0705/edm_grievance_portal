
window.loadDataToTable = function ({
    tableId,
    apiUrl,
    httpMethod = 'POST',
    payload,
    rowBuilder,
    onTableInit = () => { } // callback to return DataTable instance
}) {
    const tableSelector = `#${tableId}`;
    const tableBody = $(`${tableSelector} tbody`);
    tableBody.html('<tr><td colspan="10" class="text-center">Loading...</td></tr>');

    $.ajax({
        url: apiUrl,
        method: httpMethod.toUpperCase(),
        headers: {
            'X-APP-Key': "edm",
            'X-APP-Name': "edm"
        },
        data: { data: payload },
        dataType: 'json',
        cache: false,
        success(response) {
            const data = decryptData(response.data);
            tableBody.empty();

            if (data.length === 0) {
                tableBody.html('<tr><td colspan="10" class="text-center">No Data Found</td></tr>');
                return;
            }

            if ($.fn.DataTable?.isDataTable(tableSelector)) {
                $(tableSelector).DataTable().clear().destroy();
            }

            const rows = data.map(rowBuilder).join('');
            tableBody.html(rows);

            const dtRef = $(tableSelector).DataTable({
                paging: true,
                searching: true,
                ordering: true,
                responsive: true,
            });

            // Send reference back to main script
            onTableInit(dtRef);
        },
        error(xhr, status, error) {
            console.error("API Error:", error);
            tableBody.html('<tr><td colspan="10" class="text-center">No Data Found</td></tr>');
        }
    });
};
