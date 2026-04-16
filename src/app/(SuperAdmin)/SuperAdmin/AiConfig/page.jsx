"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Settings, ChevronDown, DollarSign, Zap, RefreshCw } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";

const providerColors = {
  OpenAI: "bg-emerald-100 text-emerald-700",
  AzureOpenAI: "bg-blue-100 text-blue-700",
  Anthropic: "bg-orange-100 text-orange-700",
  GoogleVertex: "bg-purple-100 text-purple-700",
  Ollama: "bg-slate-100 text-slate-700",
};

export default function AIConfigPage() {
  const [tenants, setTenants] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    provider: "OpenAI",
    modelName: "gpt-4o-mini",
    embeddingModel: "text-embedding-3-small",
    apiKey: "",
    azureEndpoint: "",
    azureDeploymentName: "",
    monthlyTokenBudget: 1000000,
    costAlertThresholdUsd: 50,
    allowedFeatures: '["Search","Chat","Summarization","Recommendation"]',
  });

  useEffect(() => {
    fetchTenants();
    fetchProviders();
  }, []);

  const fetchTenants = async () => {
    const { data } = await api.get("/api/super-admin/companies", { params: { pageSize: 100 } });
    setTenants(data.items.map((c) => ({ id: c.id, name: c.companyName, plan: c.companyPlan })));
  };

  const fetchProviders = async () => {
    const { data } = await api.get("/api/super-admin/ai-config/providers");
    setProviders(data);
  };

  const fetchConfigs = async (tenantId) => {
    setLoading(true);
    const { data } = await api.get(`/api/super-admin/ai-config/companies/${tenantId}`);
    setConfigs(data);
    setLoading(false);
  };

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    fetchConfigs(tenant.id);
  };

  const handleSaveConfig = async () => {
    if (!selectedTenant) return;
    await api.post(`/api/super-admin/ai-config/companies/${selectedTenant.id}`, form);
    fetchConfigs(selectedTenant.id);
    setShowForm(false);
  };

  const selectedProvider = providers.find(
    (p) => p.provider === form.provider
  );

  return (
    <div>
      <TopBar title="AI Configuration" subtitle="Configure LLM providers and models per tenant" />
      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Tenant list */}
        <div className="col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Select Tenant</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTenantSelect(t)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${selectedTenant?.id === t.id ? "bg-slate-900 text-white hover:bg-slate-900" : ""}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${selectedTenant?.id === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedTenant?.id === t.id ? "text-white" : "text-slate-900"}`}>{t.name}</p>
                      <p className={`text-xs truncate ${selectedTenant?.id === t.id ? "text-slate-300" : "text-slate-500"}`}>{t.plan}</p>
                    </div>
                  </button>
                ))}
                {!tenants.length && (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No tenants yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Config panel */}
        <div className="col-span-8 space-y-4">
          {!selectedTenant ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bot className="h-10 w-10 text-slate-300 mb-3" />
                <p className="font-medium text-slate-600">Select a tenant</p>
                <p className="text-sm text-slate-400 mt-1">Choose a tenant from the left to configure its AI settings</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedTenant.name}</h2>
                  <p className="text-sm text-slate-500">AI Configuration</p>
                </div>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                  <Plus className="h-3.5 w-3.5" /> Configure AI
                </Button>
              </div>

              {/* Configure form */}
              {showForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">New AI Configuration</CardTitle>
                    <CardDescription>Set LLM provider, model, and usage limits for {selectedTenant.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Provider</label>
                        <select
                          value={form.provider}
                          onChange={(e) => setForm({ ...form, provider: e.target.value, modelName: "", embeddingModel: "" })}
                          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          {providers.map((p) => (
                            <option key={p.provider} value={p.provider}>{p.provider}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Model</label>
                        <select
                          value={form.modelName}
                          onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          {selectedProvider?.models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Embedding Model</label>
                        <select
                          value={form.embeddingModel}
                          onChange={(e) => setForm({ ...form, embeddingModel: e.target.value })}
                          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          {selectedProvider?.embeddings.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">API Key</label>
                        <input
                          type="password"
                          value={form.apiKey}
                          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                        />
                      </div>
                    </div>

                    {form.provider === "AzureOpenAI" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Azure Endpoint</label>
                          <input
                            value={form.azureEndpoint}
                            onChange={(e) => setForm({ ...form, azureEndpoint: e.target.value })}
                            placeholder="https://your-resource.openai.azure.com"
                            className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Deployment Name</label>
                          <input
                            value={form.azureDeploymentName}
                            onChange={(e) => setForm({ ...form, azureDeploymentName: e.target.value })}
                            className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Monthly Token Budget</label>
                        <input
                          type="number"
                          value={form.monthlyTokenBudget}
                          onChange={(e) => setForm({ ...form, monthlyTokenBudget: Number(e.target.value) })}
                          className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Cost Alert Threshold (USD)</label>
                        <input
                          type="number"
                          value={form.costAlertThresholdUsd}
                          onChange={(e) => setForm({ ...form, costAlertThresholdUsd: Number(e.target.value) })}
                          className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                      <Button onClick={handleSaveConfig}>Save Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing configs */}
              {loading ? (
                <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-slate-400 h-5 w-5" /></div>
              ) : configs.length > 0 ? (
                <div className="space-y-3">
                  {configs.map((config) => (
                    <Card key={config.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2.5">
                              <Bot className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${providerColors[config.provider] || "bg-slate-100 text-slate-700"}`}>
                                  {config.provider}
                                </span>
                                {config.isActive && <Badge variant="success">Active</Badge>}
                              </div>
                              <p className="font-semibold text-slate-900 mt-1">{config.modelName}</p>
                              <p className="text-xs text-slate-500">Embedding: {config.embeddingModel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <DollarSign className="h-3.5 w-3.5" />
                              Alert at ${config.costAlertThresholdUsd}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                              <Zap className="h-3.5 w-3.5" />
                              {(config.monthlyTokenBudget / 1_000_000).toFixed(1)}M tokens/mo
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Settings className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="font-medium text-slate-600">No AI configuration yet</p>
                    <p className="text-sm text-slate-400 mt-1">Click &quot;Configure AI&quot; to set up the LLM provider</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
