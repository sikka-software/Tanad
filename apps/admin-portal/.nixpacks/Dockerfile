FROM ghcr.io/railwayapp/nixpacks:ubuntu-1742861060

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/


COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d


ARG CI NIXPACKS_METADATA NODE_ENV NPM_CONFIG_PRODUCTION
ENV CI=$CI NIXPACKS_METADATA=$NIXPACKS_METADATA NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
RUN --mount=type=cache,id=2wDbdj5cMQQ-/root/npm,target=/root/.npm npx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm install

# build phase
COPY . /app/.
RUN --mount=type=cache,id=2wDbdj5cMQQ-next/cache,target=/app/.next/cache --mount=type=cache,id=2wDbdj5cMQQ-node_modules/cache,target=/app/node_modules/.cache npx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app

CMD ["npx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm run start"]

