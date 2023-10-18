FROM node:16-bullseye

ENV LAMBDA_TASK_ROOT=/var/task
ENV LAMBDA_TASK_USER=sbx_user1051
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV XDG_CACHE_HOME=/tmp

RUN apt-get update && apt-get -y install cmake libnss3
RUN useradd -m -r -U ${LAMBDA_TASK_USER} && mkdir ${LAMBDA_TASK_ROOT}
RUN ln -s ${XDG_CACHE_HOME} /home/${LAMBDA_TASK_USER}/.pki

COPY headless_shell ${LAMBDA_TASK_ROOT}
COPY src/app.js     ${LAMBDA_TASK_ROOT}
COPY package.json   ${LAMBDA_TASK_ROOT}

RUN chown -R ${LAMBDA_TASK_USER}:${LAMBDA_TASK_USER} ${LAMBDA_TASK_ROOT}

USER ${LAMBDA_TASK_USER}

WORKDIR ${LAMBDA_TASK_ROOT}

RUN npm install --omit=dev aws-lambda-ric

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]

CMD ["app.handler"]
