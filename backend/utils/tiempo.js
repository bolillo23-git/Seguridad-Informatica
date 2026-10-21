import ntpClient from 'ntp-client';

export const obtenerHoraNTP = () => {
    return new Promise((resolve) => {
      
        ntpClient.getNetworkTime("pool.ntp.org", 123, (error, fechaNTP) => {
            if (error) {
                console.error("Fallo la conexión NTP, usando reloj local:", error);
                resolve(new Date()); 
            } else {
                resolve(fechaNTP); 
            }
        });
    });
};