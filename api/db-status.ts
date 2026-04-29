import app from "../lib/api-app";

export default function handler(req: any, res: any) {
  return app(req, res);
}
