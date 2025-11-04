import type {
  LeadPayload,
  LeadResponse,
  LeadsListResponse,
  Property,
  PropertyFormPayload,
  PropertiesResponse
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`[${response.status}] ${message || "Erro ao comunicar com o servidor"}`);
  }

  return (await response.json()) as T;
}

export const api = {
  listProperties(params: Record<string, string | number | undefined> = {}): Promise<PropertiesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return request<PropertiesResponse>(`/properties${query ? `?${query}` : ""}`);
  },

  getProperty(identifier: string | number): Promise<Property> {
    return request<Property>(`/properties/${identifier}`);
  },

  createProperty(payload: PropertyFormPayload, token: string): Promise<Property> {
    return request<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
  },

  updateProperty(id: number, payload: Partial<PropertyFormPayload>, token: string): Promise<Property> {
    return request<Property>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
  },

  deleteProperty(id: number, token: string): Promise<void> {
    return request<void>(`/properties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  submitLead(payload: LeadPayload): Promise<LeadResponse> {
    return request<LeadResponse>("/leads", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  login(email: string, password: string): Promise<{ access_token: string; expires_at: string }> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    return request<{ access_token: string; expires_at: string }>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
  },

  listLeads(token: string): Promise<LeadsListResponse> {
    return request<LeadsListResponse>("/leads", {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
