export function validateRFC1123Subdomain(text: string) {
  const regex = /^(app=)?[a-z](?!.*\.-|\.-.*)[a-z0-9\-.]*$/;

  if (!regex.test(text)) {
    return `"${text}" is not a valid site name. Site names must consist only of lowercase letters , numbers , hyphens (-), periods (.) and  start with a letter.`;
  }

  return null;
}

export function validatePort(port: number | string) {
  const validPort = Number(port);

  if (typeof validPort !== 'number') {
    return `Invalid port: ${port} (not a number)`;
  }

  if (!Number.isInteger(validPort)) {
    return 'Invalid port: Not an integer';
  }

  if (validPort < 0 || validPort > 65535) {
    return `Invalid port: ${port} (out of range)`;
  }

  // Port is valid
  return null;
}

export function startsWithApp(text: string = '') {
  const regex = /^app=/;

  if (!regex.test(text)) {
    return `'A selector must begin with app='`;
  }

  return null;
}
