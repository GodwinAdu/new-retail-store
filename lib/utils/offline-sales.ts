// Client-side offline sales utility
export class OfflineSalesManager {
  private static STORAGE_KEY = 'offline_sales';
  
  // Store sale offline
  static storeSale(saleData: any) {
    const localId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineSale = {
      localId,
      saleData,
      timestamp: new Date().toISOString(),
      deviceId: this.getDeviceId()
    };
    
    const existingSales = this.getOfflineSales();
    existingSales.push(offlineSale);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSales));
    
    return localId;
  }
  
  // Get all offline sales
  static getOfflineSales() {
    const sales = localStorage.getItem(this.STORAGE_KEY);
    return sales ? JSON.parse(sales) : [];
  }
  
  // Sync with server when online
  static async syncSales(storeId: string, branchId: string) {
    const offlineSales = this.getOfflineSales();
    const results = [];
    
    for (const sale of offlineSales) {
      try {
        const response = await fetch('/api/offline/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'store',
            storeId,
            branchId,
            saleData: sale.saleData,
            localId: sale.localId,
            deviceId: sale.deviceId
          })
        });
        
        if (response.ok) {
          results.push({ localId: sale.localId, success: true });
        } else {
          results.push({ localId: sale.localId, success: false });
        }
      } catch (error) {
        results.push({ localId: sale.localId, success: false, error });
      }
    }
    
    // Remove successfully synced sales
    const failedSales = offlineSales.filter(sale => 
      !results.find(r => r.localId === sale.localId && r.success)
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(failedSales));
    
    return results;
  }
  
  private static getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
}