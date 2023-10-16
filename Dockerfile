FROM node:16-buster

ENV LAMBDA_TASK_ROOT=/var/task
ENV LAMBDA_TASK_USER=sbx_user1051
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN apt-get update && apt-get -y install aptitude cmake gpg
RUN curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor | tee /etc/apt/trusted.gpg.d/google.gpg >/dev/null
RUN echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
RUN aptitude update && aptitude install -y google-chrome-stable
RUN useradd -m -r -U ${LAMBDA_TASK_USER} && mkdir ${LAMBDA_TASK_ROOT}

COPY src/app.js   ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}

RUN chown -R ${LAMBDA_TASK_USER}:${LAMBDA_TASK_USER} ${LAMBDA_TASK_ROOT}

USER ${LAMBDA_TASK_USER}

WORKDIR ${LAMBDA_TASK_ROOT}

RUN npm install --omit=dev aws-lambda-ric

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]

CMD ["app.handler"]
