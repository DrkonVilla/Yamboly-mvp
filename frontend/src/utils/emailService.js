import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'service_2w8xjql';
const TEMPLATE_ID = 'template_l2mlzrd';
const PUBLIC_KEY  = 'Quw8jjm_iHSNlH3dk';

/**
 * Envía el correo de confirmación de compra.
 * NUNCA bloquea el flujo de checkout: cualquier error se captura y se
 * registra en consola, pero NO se propaga hacia arriba.
 *
 * @param {object} orden   - Objeto de orden devuelto por el backend
 *                           ({ id, items, total, canal, direccion_envio, ... })
 * @param {object} usuario - Objeto usuario del authStore ({ email, nombre, ... })
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const enviarConfirmacionCompra = async (orden, usuario) => {
  try {
    // Construir lista de productos legible para el template
    const productosTexto = (orden.items || [])
      .map((item) => `${item.cantidad}x ${item.nombre || item.producto?.nombre || 'Producto'}`)
      .join(', ');

    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        email_id:  usuario?.email  || '',
        name:      usuario?.nombre || 'Cliente',
        order_id:  orden.id,
        productos: productosTexto || 'Ver detalle en la tienda',
        total:     Number(orden.total ?? 0).toFixed(2),
        canal:     orden.canal || 'web',
        direccion: orden.direccion_envio || 'No especificada',
      },
      PUBLIC_KEY
    );

    console.log('✅ Correo de confirmación enviado correctamente');
    return { success: true };
  } catch (error) {
    // Importante: NO relanzar el error — el checkout debe continuar sin importar esto.
    console.error('⚠️ No se pudo enviar el correo de confirmación (no crítico):', error);
    return { success: false, error };
  }
};
