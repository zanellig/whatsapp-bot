# Bot de WhatsApp con BuilderBot

Este bot de WhatsApp está construido utilizando BuilderBot y puede procesar tanto mensajes de texto como notas de voz.

## Requisitos Previos

- Node.js v21 o superior
- pnpm (recomendado) o npm
- Una instancia de n8n corriendo con el flujo de trabajo configurado
- WhatsApp en tu teléfono móvil

## Configuración

1. Clona este repositorio:

```bash
git clone https://github.com/zanellig/whatsapp-bot.git
cd whatsapp-bot
```

2. Instala las dependencias:

```bash
pnpm install
```

3. Crea un archivo `.env` en la raíz del proyecto con la siguiente variable:

```plaintext
API_ENTRY=http://tu-servidor-n8n:puerto/webhook/tu-webhook-id
```

## Configuración de n8n

1. Asegúrate de tener n8n instalado y corriendo
2. Crea dos flujos de trabajo separados:
   - Uno para procesar mensajes de texto
   - Otro para procesar notas de voz (archivos de audio)
3. Configura un webhook en n8n que acepte:
   - Peticiones POST para mensajes de texto
   - Peticiones POST con archivos multipart/form-data para notas de voz
4. El webhook debe devolver el texto que quieres que el bot responda

## Desarrollo

Para ejecutar el bot en modo desarrollo:

```bash
pnpm dev
```

## Producción

Para compilar y ejecutar en producción:

```bash
pnpm build
pnpm start
```

## Docker

También puedes ejecutar el bot usando Docker:

1. Construye la imagen:

```bash
docker build -t whatsapp-bot .
```

2. Ejecuta el contenedor:

```bash
docker run -p 3008:3008 --env-file .env whatsapp-bot
```

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- `src/app.ts`: Punto de entrada de la aplicación
- `src/flows/`: Contiene los flujos de conversación
  - `text-flow.ts`: Maneja mensajes de texto
  - `voice-note-flow.ts`: Maneja notas de voz
- `src/utils/`: Utilidades generales

## Características

- Procesamiento de mensajes de texto
- Procesamiento de notas de voz
- Integración con n8n para el procesamiento de mensajes
- Almacenamiento temporal de archivos de audio
- Sistema de respuestas dinámicas

## Notas Importantes

- Al iniciar el bot por primera vez, necesitarás escanear un código QR con WhatsApp para autenticar la sesión
- Asegúrate de que la URL en `API_ENTRY` sea accesible desde donde se ejecuta el bot
- Los archivos temporales se almacenan en el directorio `tmp/` y se limpian automáticamente
- El puerto predeterminado es 3008, pero puede cambiarse mediante la variable de entorno `PORT`

## Solución de Problemas

Si encuentras problemas:

1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que n8n esté accesible desde el bot
3. Comprueba los logs para mensajes de error
4. Verifica que el teléfono con WhatsApp tenga conexión a internet

## Contribuir

Las contribuciones son bienvenidas. Por favor, asegúrate de seguir las guías de estilo existentes y ejecutar el linter antes de enviar un PR:

```bash
pnpm lint
```
