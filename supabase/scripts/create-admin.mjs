// Creates the admin account: the Supabase Auth user and its staff row with is_admin (RN027).
// Run by the designated member: node --env-file=.env.local supabase/scripts/create-admin.mjs
// Never prints the e-mail, the password or the key, which come only from the environment.
import { createClient } from "@supabase/supabase-js";

const REQUIRED_VARIABLES = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
];

// Fixed name of the admin account, shown only on the admin's own panel (docs/equipe/dados.md).
const ADMIN_FIRST_NAME = "Administrador";
const ADMIN_LAST_NAME = "Glow";

// Same formats as the schemas of src/shared/validation (RN035, RS003): the script runs
// outside the application, so it checks them on its own.
const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

function isValidEmail(email) {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}

function isValidPassword(password) {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    /\p{Lu}/u.test(password) &&
    /\d/.test(password) &&
    /[^\p{L}\d]/u.test(password)
  );
}

async function main() {
  const missing = REQUIRED_VARIABLES.filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missing.length > 0) {
    return `Defina no ambiente: ${missing.join(", ")}.`;
  }

  const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!isValidEmail(email)) {
    return "SEED_ADMIN_EMAIL não é um e-mail válido.";
  }
  if (!isValidPassword(password)) {
    return "SEED_ADMIN_PASSWORD precisa ter de 8 a 72 caracteres, com ao menos uma letra maiúscula, um número e um caractere especial.";
  }

  // The key goes to the client as it is: a secret key (sb_secret_...) or the legacy service_role key.
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const { data: existingAdmin, error: queryError } = await supabase
    .from("staff")
    .select("id")
    .eq("is_admin", true)
    .maybeSingle();
  if (queryError) {
    return `Não foi possível consultar a tabela staff: ${queryError.message}`;
  }
  if (existingAdmin) {
    console.log("A conta de administrador já existe; nada foi alterado.");
    return null;
  }

  // The account is born with the e-mail confirmed, so no e-mail is sent (decisions 0015 and 0044).
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createError) {
    if (
      createError.code === "email_exists" ||
      createError.code === "user_already_exists"
    ) {
      return "O e-mail de SEED_ADMIN_EMAIL já tem conta no Supabase Auth; use outro (RN022).";
    }
    return `Não foi possível criar a conta no Supabase Auth: ${createError.message}`;
  }

  const userId = created.user.id;
  const { error: insertError } = await supabase.from("staff").insert({
    id: userId,
    first_name: ADMIN_FIRST_NAME,
    last_name: ADMIN_LAST_NAME,
    email,
    is_admin: true,
  });
  if (insertError) {
    // Without the staff row the account is useless: remove it, as the backend does on sign-up.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    const cleanup = deleteError
      ? `A conta criada no Supabase Auth não pôde ser removida (${deleteError.message}); remova-a pelo painel.`
      : "A conta criada no Supabase Auth foi removida.";
    return `Não foi possível gravar o administrador em staff: ${insertError.message}. ${cleanup}`;
  }

  console.log("Conta de administrador criada.");
  return null;
}

const failure = await main();
if (failure) {
  console.error(failure);
  process.exitCode = 1;
}
