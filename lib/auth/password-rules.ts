export const PASSWORD_REQUIREMENTS_TEXT =
    'Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial.';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function getPasswordValidationMessage(password: string) {
    if (password.length < 8) {
        return 'La contrasena debe tener al menos 8 caracteres.';
    }

    if (!PASSWORD_REGEX.test(password)) {
        return 'La contrasena debe incluir una mayuscula, una minuscula, caracter especial y un numero.';
    }

    return null;
}
