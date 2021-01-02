import * as vault from 'node-vault';

export const getVaultConfig = async () => {
  const client = vault({
    token: process.env.VAULT_TOKEN
  });
  try {
    const [
      serviceHost,
      servicePort,
      natsUrl,
      publicKey,
      natsQueue,
      privateKey,
      passphrase,
      authExpiresIn
    ] = await Promise.all(
      [
        'secret/service/shared/authenticationServiceHost',
        'secret/service/shared/authenticationServicePort',
        'secret/service/shared/natsUrl',
        'secret/service/shared/publicKey',
        'secret/service/authentication/natsQueue',
        'secret/service/authentication/privateKey',
        'secret/service/authentication/passphrase',
        'secret/service/authentication/authExpiresIn'
      ].map((path) => client.read(path).then(({ data }) => data.value))
    );
    return {
      serviceHost,
      servicePort,
      natsUrl,
      publicKey,
      natsQueue,
      privateKey,
      passphrase,
      authExpiresIn
    };
  } catch (error) {
    throw Error(error.response.body.warnings);
  }
};
