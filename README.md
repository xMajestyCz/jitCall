# jitCall
Aplicación móvil llamada jitCall utilizando Ionic, Firebase (Authentication y Firestore), y servicios externos para notificaciones y videollamadas. La app permitire a los usuarios registrarse, iniciar sesión, gestionar contactos y realizar videollamadas mediante notificaciones push.

## Tecnologías Utilizadas

- **Ionic Framework**
- **Firebase Authentication**
- **Firestore Database**
- **Firebase Cloud Messaging (FCM)**
- **Capacitor Notifications**
- **Servidor de Videollamadas Jitsi Meet**
- **API externa para envío de notificaciones**

---

## Características Principales

### 1. Autenticación y Registro de Usuarios
- Registro con nombre, apellido, correo, teléfono y contraseña.
- Firebase Authentication almacena correo y contraseña.
- Firestore almacena nombre, apellido y teléfono.
- Guards para proteger rutas según estado de autenticación.
- Interceptor HTTP para añadir token de autenticación a solicitudes.

### 2. Gestión de Contactos
- Visualización de la lista de contactos en la página principal.
- Agregado de nuevos contactos mediante número de teléfono.
- Validación de existencia de usuarios en Firestore antes de agregar.

### 3. Notificaciones Push
- Obtención y almacenamiento de token FCM del dispositivo.
- Solicitud de permisos de notificaciones.
- Envío de notificaciones push mediante API externa.
- Integración de Interceptor HTTP para añadir token Bearer automáticamente en solicitudes a la API externa.

### 4. Videollamadas en Tiempo Real
- Inicio de llamadas mediante notificaciones push.
- Recepción de llamadas con opciones de aceptar o rechazar.
- Integración con servidor público Jitsi Meet:  
  [https://jitsi1.geeksec.de/](https://jitsi1.geeksec.de/)
- Uso de UUID único por llamada.
