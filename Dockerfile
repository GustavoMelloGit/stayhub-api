# Etapa 1: Build - Instala dependências e cria o executável
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

# Instala todas as dependências (incluindo dev) necessárias para o build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copia todo o código-fonte
COPY . .

# Roda o script de build para criar o executável chamado 'out'
RUN bun run build

# ---
# Etapa 2: Release - A imagem final, super enxuta
FROM oven/bun:1-slim AS release
WORKDIR /usr/src/app

# Copia APENAS o executável binário da etapa de build
COPY --from=build /usr/src/app/out .

# Expõe a porta e executa o binário
USER bun
EXPOSE 3000/tcp
CMD ["./out"]