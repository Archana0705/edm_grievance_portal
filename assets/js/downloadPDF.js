window.downloadPDF = function () {
    const { jsPDF } = window.jspdf;
    const card = document.getElementById('ackCard');
    if (!card) return;

    html2canvas(card).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - 20; // margin
        const imgHeight = canvas.height * imgWidth / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save("acknowledgement.pdf");
    }).catch(err => console.error(err));
};
