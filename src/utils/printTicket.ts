import type { Ticket } from '../types';
import dayjs from 'dayjs';

export const printTicket = (ticket: Partial<Ticket>) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatNumber = (num?: number | string) => {
        if (num === undefined || num === null || num === '') return '0';
        const n = typeof num === 'string' ? Number(num) : num;
        return isNaN(n) ? '0' : n.toLocaleString();
    };
    const formatCurrency = (num?: number) => num ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return dayjs(dateStr).isValid() ? dayjs(dateStr).format('DD/MM/YYYY HH:mm:ss') : dateStr;
    }

    const companyName = "บริษัท ออสการ์ เซฟ เดอะ เวิลด์ จำกัด";
    const plantAddress = ticket.SAP_Address2 || "33/1 หมู่ที่ 9 ตำบลไสหร้า อำเภอฉวาง จังหวัดนครศรีธรรมราช";

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Weigh Ticket - ${ticket.ticketNumber}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            
            body { 
                font-family: 'Sarabun', sans-serif; 
                padding: 20px; 
                color: #000;
                max-width: 800px;
                margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0; font-size: 14px; }
            
            .ticket-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .ticket-id { font-size: 18px; font-weight: bold; }
            
            .section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 5px; font-size: 14px; color: #555; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; color: #444; }
            
            .weights-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .weights-table th, .weights-table td { border: 1px solid #000; padding: 8px; text-align: center; }
            .weights-table th { background-color: #f0f0f0; }
            
            .finance-box { margin-top: 20px; text-align: right; }
            .finance-row { display: flex; justify-content: flex-end; gap: 20px; font-size: 16px; margin-bottom: 5px; }
            .finance-total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
            
            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; width: 80%; margin-left: auto; margin-right: auto; }
            
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${companyName}</h1>
            <p>${plantAddress}</p>
            <h2 style="margin-top: 10px;">ใบชั่งน้ำหนัก (Weigh Ticket)</h2>
        </div>

        <div class="ticket-info">
            <div class="ticket-id">Ticket No: ${ticket.ticketNumber}</div>
            <div>Date: ${dayjs().format('DD/MM/YYYY')}</div>
        </div>

        <div class="grid section">
            <div class="row"><span class="label">ผู้ขาย (Seller):</span> <span>${ticket.sellerName || '-'}</span></div>
            <div class="row"><span class="label">ทะเบียนรถ (License Plate):</span> <span>${ticket.licensePlate || '-'}</span></div>
            <div class="row"><span class="label">สินค้า (Product):</span> <span>${ticket.resourceName || '-'}</span></div>
            <div class="row"><span class="label">ประเภทการชำระ (Payment):</span> <span>${ticket.paymentType?.toUpperCase()}</span></div>
            <div class="row"><span class="label">เลขที่ใบกำกับ (Tax Inv):</span> <span>${ticket.SAP_NumAtCard || '-'}</span></div>
            ${ticket.paymentType === 'po' ? `<div class="row"><span class="label">PO Number:</span> <span>${ticket.SAP_BaseRef || '-'}</span></div>` : ''}
        </div>

        <table class="weights-table">
            <thead>
                <tr>
                    <th>รายการ</th>
                    <th>วัน-เวลา</th>
                    <th>น้ำหนัก (กก.)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: left;">น้ำหนักเข้า (Weight In)</td>
                    <td>${formatDate(ticket.entryDateTime)}</td>
                    <td style="text-align: right; font-weight: bold;">${formatNumber(ticket.weightIn)}</td>
                </tr>
                <tr>
                    <td style="text-align: left;">น้ำหนักออก (Weight Out)</td>
                    <td>${formatDate(ticket.exitDateTime)}</td>
                    <td style="text-align: right; font-weight: bold;">${formatNumber(ticket.weightOut)}</td>
                </tr>
                <tr>
                    <td style="text-align: left; background-color: #f9f9f9;"><strong>น้ำหนักสุทธิ (Net Weight)</strong></td>
                    <td style="background-color: #f9f9f9;"></td>
                    <td style="text-align: right; font-weight: bold; font-size: 16px; background-color: #f9f9f9;">${formatNumber(ticket.netWeight)}</td>
                </tr>
            </tbody>
        </table>

        <div class="section" style="margin-top: 15px; border: none;">
             <div class="row" style="justify-content: flex-start; gap: 10px;">
                <span class="label">หมายเหตุ (Remarks):</span> 
                <span>${ticket.remarks || '-'}</span>
             </div>
        </div>

        <div class="finance-box">
             <div class="finance-row">
                <span>ราคาต่อหน่วย (Unit Price):</span>
                <span>${formatCurrency(ticket.unitPrice)} บาท</span>
             </div>
            <div class="finance-row">
                <span>จำนวนเงิน (Total):</span>
                <span>${formatCurrency(ticket.totalPrice)} บาท</span>
             </div>
             <!-- VAT Hidden as price is Net -->
             <div class="finance-row finance-total">
                <span>จำนวนเงินสุทธิ (Grand Total):</span>
                <span>${formatCurrency(ticket.GrandTotal)} บาท</span>
             </div>
        </div>

        <div class="footer">
            <div>
                <div class="signature-line"></div>
                <p>พนักงานชั่ง (Weighbridge Operator)</p>
                <p>(${ticket.createdBy || '..................................'})</p>
            </div>
            <div>
                <div class="signature-line"></div>
                <p>ผู้ส่งสินค้า / พนักงานขับรถ</p>
                <p>(Driver / Supplier)</p>
            </div>
        </div>

        <script>
            window.onload = function() { window.print(); }
        </script>
    </body>
    </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
};
