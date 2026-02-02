# Mapping Table: Database vs Ticket Form

| Database Column | ชื่อ Field (Ticket Form) | คำอธิบาย / Logic การดึงข้อมูล |
| :--- | :--- | :--- |
| **Header Information** | | |
| `SAP_DBName` | *System Config* | **[HIDDEN]** กำหนดค่าตายตัว (เช่น 'SB_OSCAR_LIVE') ไม่ต้องกรอก |
| `SAP_RefNo` | Ticket No. | **[AUTO]** เลขที่ตั๋วชั่ง (Auto-gen โดยระบบ) |
| `PaymentType` | Payment Type | **[SELECT]** เลือก 'Cash' หรือ 'Credit' (PO) |
| `SAP_PostingDate` | Date In | **[AUTO]** ใช้วันที่เดียวกับวันที่รถเข้า (entryDateTime) |
| `SAP_DueDate` | *Calulated* | **[AUTO]** ถ้า Cash = วันที่เข้า, ถ้า PO = คำนวณตาม Credit Term (หรือ default เป็นวันที่เข้า) |
| `SAP_TaxDate` | Tax Invoice Date | **[NEW INPUT]** วันที่ใบกำกับภาษี (Default = Today) |
| `SAP_NumAtCard` | Tax Invoice No. | **[NEW INPUT]** เลขที่ใบกำกับภาษีจาก Supplier |
| `SAP_CardCode` | Seller Name | **[AUTO]** ดึง `VendorCode` จาก Supplier ที่เลือก |
| `SAP_Address` | Seller Address | **[AUTO]** ดึง `Title` + `Address` จาก Supplier ที่เลือก |
| `SAP_Address2` | *System Config* | **[HIDDEN]** ที่อยู่สาขาที่รับของ (Fix ค่าตามสาขา) |
| `SAP_Comments` | Remarks | **[INPUT]** หมายเหตุ |
| `ProjectCode` | Project | **[HIDDEN]** Fix ค่าเป็น Project Code ของสาขา |
| **Financial & Amounts** | | |
| `ItemCode` | Product | **[AUTO]** ดึง `ProductCode` จากสินค้าที่เลือก |
| `ItemName` | Product Name | **[AUTO]** ชื่อสินค้าที่เลือก |
| `UnitMsr` | Unit | **[HIDDEN]** Fix ค่าเป็น 'KG' |
| `TaxCode` | Vat Group | **[HIDDEN/SELECT]** 'V7' (7%) หรือ 'V0' (Exempt) |
| `VatAmount` | Vat Amount | **[CALCULATED]** `Total Price * 0.07` |
| `GrandTotal` | Grand Total | **[CALCULATED]** `Total Price + Vat Amount` |
| `GrossPrice` | *Calculated* | **[CALCULATED]** `UnitPrice * 1.07` |
| `LineNum` | *Default* | **[HIDDEN]** Default = 0 |
| **PO Specific (เฉพาะกรณี PO)** | | |
| `SAP_BaseType` | *System Logic* | **[HIDDEN]** ถ้า Payment='PO' ให้ค่า '22' (Purchase Order) |
| `SAP_BaseRef` | PO Number | **[NEW INPUT]** เลขที่ใบสั่งซื้อ (แสดงเมื่อเลือก PO) |
| `SAP_BaseLine` | PO Line Num | **[NEW INPUT]** ลำดับรายการใน PO (แสดงเมื่อเลือก PO) |
