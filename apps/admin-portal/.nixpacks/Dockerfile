FROM ghcr.io/railwayapp/nixpacks:ubuntu-1742861060

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/

COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
# Install Nix packages
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d

# --- Add this line ---
# Ensure binaries installed by nix-env are found in subsequent RUN commands
ENV PATH=/root/.nix-profile/bin:$PATH
# --- End of added line ---

ARG CI NIXPACKS_METADATA NODE_ENV NPM_CONFIG_PRODUCTION INFISICAL_TOKEN # Added INFISICAL_TOKEN here
ENV CI=$CI NIXPACKS_METADATA=$NIXPACKS_METADATA NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION INFISICAL_TOKEN=$INFISICAL_TOKEN # Added INFISICAL_TOKEN here

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
# Check if INFISICAL_TOKEN is set before running install
RUN if [ -z "$INFISICAL_TOKEN" ]; then echo "Error: INFISICAL_TOKEN is not set." && exit 1; fi && \
    --mount=type=cache,id=2wDbdj5cMQQ-/root/npm,target=/root/.npm \
    pnpm dlx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm install

# build phase
COPY . /app/.
# Check if INFISICAL_TOKEN is set before running build
RUN if [ -z "$INFISICAL_TOKEN" ]; then echo "Error: INFISICAL_TOKEN is not set." && exit 1; fi && \
    --mount=type=cache,id=2wDbdj5cMQQ-next/cache,target=/app/.next/cache \
    --mount=type=cache,id=2wDbdj5cMQQ-node_modules/cache,target=/app/node_modules/.cache \
    pnpm dlx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app

# Check if INFISICAL_TOKEN is set before defining CMD (for clarity, actual check is at runtime)
# Note: The token needs to be passed as an ENV var when running the container, not just during build
CMD ["sh", "-c", "if [ -z \"$INFISICAL_TOKEN\" ]; then echo 'Error: INFISICAL_TOKEN environment variable is not set.' && exit 1; fi && pnpm dlx @infisical/cli run --env=dev --domain=https://secrets.sikka.io --projectId=b1c8c504-ff56-43bb-9226-b1035bf94426 --token=$INFISICAL_TOKEN pnpm run start"]