import scrape from "@/lib/scraperWorker";
import { NextResponse } from "next/server";

// Interface para o manga retornado da API (scraping)
// Handler principal para a rota GET
export async function GET() {
  try {
    // Verifica se o cabeçalho "GitHub-Action" está presente e se o valor é o esperado
    //  const githubHeader = request.headers.get("GitHub-Action");

    //  // Substitua "YOUR_SECRET_TOKEN" pelo token que você configurou no GitHub Actions
    //  if (githubHeader !== "eKZ8IyclYXm9msLG3YGJ0WVQwTfzqDVGTerW8X9MMKukrP72r9dC2Y5Jl4zzzY7c") {
    //    return NextResponse.json(
    //      { error: "Unauthorized access" },
    //      { status: 403 } // Forbidden
    //    );
    //  }
    // Inicia o worker em segundo plano
    setImmediate(scrape); // Executa o processo de scraping assíncrono

    // Retorna resposta imediata
    return NextResponse.json(
      {
        message: "Scraping iniciado, os dados serão atualizados em breve.",
      },
      { status: 202 }
    ); // 202 Accepted
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao iniciar o scraping." },
      { status: 500 }
    );
  }
}
