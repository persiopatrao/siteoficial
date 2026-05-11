# siteoficial

## Executar localmente

1. Instale as dependências do backend:

```bash
npm install
```

2. Instale as dependências do frontend:

```bash
npm --prefix frontend install
```

3. Compile o frontend:

```bash
npm run build
```

4. Inicie o servidor:

```bash
npm start
```

O backend ficará disponível em `http://localhost:3000` e o frontend será servido pelo mesmo servidor.

## Deploy

Esta aplicação está pronta para deploy em plataformas Node.js como Heroku, Render ou qualquer serviço que suporte contêineres Docker.

### Heroku / Render

- O script `heroku-postbuild` compila o frontend automaticamente após a instalação.
- Use `npm start` para iniciar o servidor.

### Docker

- `Dockerfile` está disponível para criar uma imagem de produção.
- `docker build -t sige-site .`
- `docker run -p 3000:3000 sige-site`
