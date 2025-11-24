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

