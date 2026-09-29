const SUPPORTED_WEAPONS = ['ar', 'smg', 'awp', 'shotgun'];
const STORAGE_PREFIX = 'ds_skin_';
let inicializado = false;

function convertirImagenAWebP(file) {
    return new Promise((resolve, reject) => {
        if (!(file instanceof File)) {
            reject(new Error('El objeto recibido no es un File válido.'));
            return;
        }

        const objectURL = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            try {
                const width = image.naturalWidth;
                const height = image.naturalHeight;

                if (!width || !height) {
                    URL.revokeObjectURL(objectURL);
                    reject(new Error('La imagen no tiene dimensiones válidas.'));
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');
                if (!context) {
                    URL.revokeObjectURL(objectURL);
                    reject(new Error('No se pudo crear el contexto Canvas.'));
                    return;
                }

                context.drawImage(image, 0, 0, width, height);

                canvas.toBlob((webpBlob) => {
                    URL.revokeObjectURL(objectURL);

                    if (!webpBlob) {
                        reject(new Error('Chromium no pudo generar el WebP.'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        if (!(reader.result instanceof ArrayBuffer)) {
                            reject(new Error('El WebP generado no produjo un ArrayBuffer.'));
                            return;
                        }
                        resolve(reader.result);
                    };
                    reader.onerror = () => reject(new Error('Error leyendo el WebP generado.'));
                    reader.readAsArrayBuffer(webpBlob);
                }, 'image/webp', 0.92);

            } catch (err) {
                URL.revokeObjectURL(objectURL);
                reject(err);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectURL);
            reject(new Error(`No se pudo cargar la imagen: ${file.name}`));
        };

        image.src = objectURL;
    });
}

async function setWeaponSkin(weaponKey, file) {
    if (!SUPPORTED_WEAPONS.includes(weaponKey)) return false;
    if (!(file instanceof File) || !file.type.startsWith('image/')) return false;
    if (!window.dsSwapperAPI) return false;

    try {
        const webpBuffer = await convertirImagenAWebP(file);

        window.dsSwapperAPI.saveSwapFile(
            weaponKey,
            `${weaponKey}.webp`,
            webpBuffer
        );

        localStorage.setItem(`${STORAGE_PREFIX}${weaponKey}`, file.name);
        localStorage.setItem(`${STORAGE_PREFIX}${weaponKey}_active`, 'true');

        return true;
    } catch (err) {
        return false;
    }
}

function initSwapper(menu) {
    if (inicializado || !menu) return;
    inicializado = true;

    for (const weaponKey of SUPPORTED_WEAPONS) {
        const input = menu.querySelector(`#file-${weaponKey}`);
        if (!input) continue;

        input.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await setWeaponSkin(weaponKey, file);
        });
    }
}

module.exports = {
    initSwapper,
    setWeaponSkin
};