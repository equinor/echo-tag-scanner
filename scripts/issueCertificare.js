/* eslint-disable @typescript-eslint/no-var-requires */
var fs = require('fs');
var path = require('path');
var forge = require('node-forge');
var dirPath = './.ssl';
var keyFile = 'prkey';
var certFile = 'cert';
/** Issue X.509 certificate and store it locally into '.ssl' folder
 * @returns void
 */
var issueCertificate = function () {
    var pki = forge.pki;
    var keys = pki.rsa.generateKeyPair(2048);
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [
        {
            name: 'commonName',
            value: 'example.Echo.org'
        },
        {
            name: 'countryName',
            value: 'Norway'
        },
        {
            shortName: 'ST',
            value: 'Rogaland'
        },
        {
            name: 'localityName',
            value: 'Stavanger'
        },
        {
            name: 'organizationName',
            value: 'Echo test'
        },
        {
            shortName: 'OU',
            value: 'Echo test'
        }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 6,
                    value: 'http://localhost/webid#me'
                },
                {
                    type: 7,
                    ip: '127.0.0.1'
                }
            ]
        },
        {
            name: 'subjectKeyIdentifier'
        }
    ]);
    cert.sign(keys.privateKey);
    var prKeyPem = pki.privateKeyToPem(keys.privateKey);
    var certPem = pki.certificateToPem(cert);
    fs.writeFileSync(path.resolve(dirPath, keyFile), prKeyPem);
    fs.writeFileSync(path.resolve(dirPath, certFile), certPem);
    console.log('> New certificate was issued successfully!');
};
/** Check validity of the locally generated certificate
 * @returns boolean
 */
var isValidCertificate = function () {
    try {
        var certPem = fs.readFileSync(path.resolve(dirPath, certFile), { encoding: 'utf-8' });
        var pki = forge.pki;
        var validity = pki.certificateFromPem(certPem).validity;
        var result = validity.notAfter > new Date();
        console.log("> Certificate is " + (result ? 'valid.' : 'invalid!'));
        return result;
    }
    catch (err) {
        console.error('> ERROR while reading certificate:\n ', err);
        return false;
    }
};
/** Main function for checking certificate's validity and generating new self-signed certificates,
 * generated certificate and private key will be located in '.ssl' folder in the root of the project
 * Cli command optionally accepts *--path* flag with string value for providing path argument
 * @returns void
 */
var main = function () {
    var _a = process.argv.slice(2), flag = _a[0], value = _a[1];
    if (flag && flag === '--path' && value) {
        dirPath = path.resolve(value, dirPath);
    }
    else {
        dirPath = path.resolve(dirPath);
    }
    console.log(dirPath);
    if (!fs.existsSync(dirPath) || !isValidCertificate()) {
        fs.mkdirSync(dirPath, { recursive: true });
        issueCertificate();
    }
};
main();
