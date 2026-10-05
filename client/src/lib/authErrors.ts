const GENERIC_AUTH_ERROR = "Não foi possível concluir o acesso. Confira os dados, a conexão e a confirmação de e-mail.";

export function authErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

export function needsGoogleEmailVerification(providerId: string | null | undefined, emailVerified: boolean): boolean {
  return providerId === "google.com" && !emailVerified;
}

export function guardianAuthErrorMessage(error: unknown): string {
  const code = authErrorCode(error);
  switch (code) {
    case "auth/operation-not-allowed":
      return "Este método de acesso está desativado no Firebase. O responsável pelo projeto precisa habilitar Google ou E-mail/senha nas configurações de Authentication.";
    case "auth/unauthorized-domain":
      return "Este domínio de visualização ainda não foi autorizado em Firebase Authentication → Domínios autorizados.";
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.";
    case "auth/popup-closed-by-user":
      return "A janela do Google foi fechada antes de concluir. Você pode tentar novamente.";
    case "auth/cancelled-popup-request":
      return "Já existe uma tentativa Google aberta. Conclua essa janela ou tente novamente em instantes.";
    case "auth/network-request-failed":
      return "Não foi possível alcançar o Firebase. Confira a conexão, bloqueadores de conteúdo e tente novamente.";
    case "auth/account-exists-with-different-credential":
      return "O Firebase informou um conflito entre métodos de acesso. Este app não vincula contas automaticamente; use o método original ou habilite contas separadas por e-mail no Identity Platform.";
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
      return "A configuração Firebase deste app não corresponde a um aplicativo autorizado. Revise o projeto e o app web configurados.";
    case "APP_CHECK_REQUIRED":
    case "APP_CHECK_REJECTED":
      return "A verificação de integridade do app bloqueou a sessão. O responsável técnico precisa revisar o App Check do ambiente.";
    case "CSRF_INIT_FAILED":
    case "CSRF_REJECTED":
      return "Não foi possível validar a sessão segura. Atualize a página e tente novamente.";
    case "IDENTITY_NOT_CONFIGURED":
      return "O serviço de identidade ainda não está configurado neste ambiente.";
    case "SESSION_REJECTED":
      return "O Firebase autenticou, mas o servidor não aceitou a sessão. Confirme o e-mail e tente entrar novamente.";
    case "MFA_REQUIRED":
      return "Esta conta administrativa exige MFA TOTP. Configure um aplicativo autenticador antes de entrar.";
    default:
      return GENERIC_AUTH_ERROR;
  }
}

export function isActionableResetError(error: unknown): boolean {
  const code = authErrorCode(error);
  return code !== null && [
    "auth/operation-not-allowed",
    "auth/unauthorized-domain",
    "auth/network-request-failed",
    "auth/invalid-api-key",
    "auth/app-not-authorized",
    "APP_CHECK_REQUIRED",
    "APP_CHECK_REJECTED",
    "CSRF_INIT_FAILED",
    "CSRF_REJECTED",
    "IDENTITY_NOT_CONFIGURED",
  ].includes(code);
}
