sed -i 's/data={purchaseRequests}/data={purchaseRequests.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}/g' src/App.tsx
sed -i 's/data={purchaseOrders}/data={purchaseOrders.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}/g' src/App.tsx
sed -i 's/data={invoices}/data={invoices.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}/g' src/App.tsx
sed -i 's/data={quotations}/data={quotations.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}/g' src/App.tsx
