export class AuthService {
  private token: string | null =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTQxZjNhNi0xOGI3LTQxZTUtODc3ZC00NmVjNzlmOTA5Y2IiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9hcGkubXlhcHAuY29tIiwiYXVkIjoiaHR0cHM6Ly9hcGkubXlhcHAuY29tL3VzZXJzIiwicm9sZXMiOlt7ImlkIjoxLCJuYW1lIjoiQURNSU4ifV0sImlhdCI6MTc0NjQxODYyOCwibmJmIjoxNzQ2NDE4NjI4LCJleHAiOjE3NDczMTg2Mjh9.ERLGCy4SUaNTQR47GqhsVl5Jk95Qa5qIQKUgBOQfqS5PmdSix3ipY1BBUKfDQNPPp5Gm65FxzX7JmjmhviP7l2MZ4wFg4jMRoTDUFpIQJfvyfV-iRxFzWGmivVQxp1fJ7fhbyFXLm_owbmXGUXJ3fqm0NbdGbScV3pw6H9G9vlkQ6WxrIPSEVA014rPgK1aIvtENi2WV965rjPg-DpCMoyxXYkUPaRIDWjRJKUcpxcTlfJiX-2mwbfHZfqHfSjeOjNqQpoSTtspOaqotLQXt2JOtlRUu7b48JRAM5TN3XQwXBkuWZ6-0NNfr5h2sWs2ca1HSIgNfPkkp4pSALA7TEQ";

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }
}

export const authService = new AuthService();
