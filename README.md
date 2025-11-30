<<<<<<< HEAD
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
=======
## FBR Digital Invoicing

NestJS API that onboards vendors, authenticates them with email/password, and proxies invoice registration calls to the FBR sandbox.

> 📚 **FBR IRIS Alignment**: This system is designed to align with the real FBR IRIS (Invoice Reporting and Invoicing System) processes. See [`docs/fbr-iris-alignment.md`](./docs/fbr-iris-alignment.md) for detailed documentation on how each module maps to actual FBR requirements.

### Features

- Vendor onboarding with `businessType`, incremental numeric IDs, and role assignment (`ADMIN` or `USER`).
- Secure password storage (scrypt) plus login endpoint returning bearer tokens.
- Role-based access control so only admins can read/update/delete vendors or inspect other vendors' invoices.
- Invoice submission APIs that relay payloads to FBR with correlation IDs and persistence in memory for quick demos.
- Swagger docs (visit `/docs`) already configured with bearer authentication.

### Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` (or create `.env` file)
   - Update the MongoDB connection string if needed:
   ```env
   MONGO_URI=mongodb://localhost:27017/fbr-digital-invoicing
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start the development server:**
```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Typical Flow

1. `POST /v1/vendors/register` with vendor details (`email`, `password`, `businessType`, etc.).
2. `POST /v1/auth/login` using the registered email/password to receive a bearer token.
3. Use the `Authorization: Bearer <token>` header to call protected endpoints, e.g. `POST /v1/invoices/register`.
4. Admins (role `ADMIN`) can manage vendors and inspect invoices via the protected routes.

### Testing

```bash
npm run test          # unit tests
npm run test:e2e      # e2e tests
npm run test:cov      # coverage
```

### Documentation

- **Architecture Overview**: [`docs/architecture.md`](./docs/architecture.md) - System architecture and module relationships
- **FBR IRIS Alignment**: [`docs/fbr-iris-alignment.md`](./docs/fbr-iris-alignment.md) - How this system aligns with real FBR IRIS processes
- **Module Documentation**: [`docs/change-module-documentation.md`](./docs/change-module-documentation.md) - Detailed module documentation and MongoDB setup guide

### Environment Variables

The application requires the following environment variables (configured in `.env`):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | - | ✅ Yes |
| `PORT` | Server port | `3000` | No |
| `JWT_SECRET` | Secret key for JWT token signing | `VERY_SECRET_KEY` | No (but recommended) |

> **Note**: 
> - The `.env` file is git-ignored. Use `.env.example` as a template.
> - For production, generate a strong `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> - The project uses MongoDB for persistence. Make sure MongoDB is running before starting the server.

>>>>>>> 5d688854065ec36e355ff792028a8e7680bff78e
