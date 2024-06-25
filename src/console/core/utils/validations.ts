export function isEmpty(text?: string | number) {
  if (!text) {
    return 'Empty field';
  }

  return null;
}

const regexString = /^(?=.*[a-z0-9]$)(app=)?(?!.*\.-)(?!.*-\.)[a-z0-9-]+\.[a-z0-9-]+(?<!-)$/;

export function validateRFC1123Subdomain(text = '') {
  if (text) {
    if (!regexString.test(text)) {
      return `Invalid value "${text}": It must consist of lower case alphanumeric characters, (-) or (.), and must start and end with an alphanumeric character`;
    }
  }

  return null;
}

export function validateRFC1123SubdomainWithIP(text = '') {
  if (text) {
    const regexAppNameOrIp = new RegExp(`^(app=)?(${regexString.source}|(?:[0-9]{1,3}\\.){3}[0-9]{1,3})$`, 'i');
    if (!regexAppNameOrIp.test(text)) {
      return `Invalid value "${text}": It has to be a valid IP address or must consist of lower case alphanumeric characters, (-) or (.), and must start and end with a an alphanumeric character`;
    }
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
