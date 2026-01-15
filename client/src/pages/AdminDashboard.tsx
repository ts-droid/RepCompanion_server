import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus, Edit, Trash2, Check, RefreshCw, AlertCircle, Database, Users, Dumbbell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Exercise, EquipmentCatalog, Gym, UnmappedExercise } from "@shared/schema";
import { useLocation } from "wouter";
import "@/admin.css";

type EnhancedExercise = Exercise & { aliases?: string[] };
type EnhancedEquipment = EquipmentCatalog & { aliases?: string[] };

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Editing state
  const [editingEx, setEditingEx] = useState<EnhancedExercise | null>(null);
  const [editingEq, setEditingEq] = useState<EnhancedEquipment | null>(null);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [mappingUnmapped, setMappingUnmapped] = useState<UnmappedExercise | null>(null);
  const [newAlias, setNewAlias] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSelectedIds([]);
  };

  // Queries
  const { data: stats } = useQuery<{ usersCount: number }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: unmapped } = useQuery<UnmappedExercise[]>({
    queryKey: ["/api/admin/unmapped-exercises"],
  });

  const { data: exercises } = useQuery<EnhancedExercise[]>({
    queryKey: ["/api/admin/exercises"],
  });

  const { data: equipment } = useQuery<EnhancedEquipment[]>({
    queryKey: ["/api/admin/equipment"],
  });

  const { data: gyms } = useQuery<Gym[]>({
    queryKey: ["/api/admin/gyms"],
  });

  // Mutations
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exercise> }) => {
      const res = await apiRequest("PUT", `/api/admin/exercises/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exercises"] });
      setEditingEx(null);
      toast({ title: "Övning uppdaterad" });
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EquipmentCatalog> }) => {
      const res = await apiRequest("PUT", `/api/admin/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/equipment"] });
      setEditingEq(null);
      toast({ title: "Utrustning uppdaterad" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'exercises' | 'equipment' | 'gyms' | 'unmapped-exercises'; id: string }) => {
      const res = await apiRequest("DELETE", `/api/admin/${type}/${id}`, undefined);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${variables.type}`] });
      toast({ 
        title: `${
          variables.type === 'exercises' ? 'Övning' : 
          variables.type === 'equipment' ? 'Utrustning' : 
          variables.type === 'gyms' ? 'Gym' : 
          'Omatchad övning'
        } borttagen` 
      });
    },
  });

  const createAliasMutation = useMutation({
    // ... same as before
    mutationFn: async (data: { exerciseId: string; alias: string; lang: string }) => {
      const res = await apiRequest("POST", "/api/admin/exercise-aliases", {
        ...data,
        aliasNorm: data.alias.toLowerCase().trim(),
        source: 'admin'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unmapped-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exercises"] }); // Refresh so we see new aliases
      setMappingUnmapped(null);
      setNewAlias("");
      toast({ title: "Alias skapat" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ type, ids }: { type: 'exercises' | 'equipment' | 'gyms' | 'unmapped-exercises'; ids: string[] }) => {
      const res = await apiRequest("POST", `/api/admin/${type}/delete-batch`, { ids });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${variables.type}`] });
      setSelectedIds([]);
      toast({ 
        title: `${idsInSwedish(variables.type)} borttagna`,
        description: `${variables.ids.length} objekt raderades.`
      });
    },
  });

  function idsInSwedish(type: string) {
    switch (type) {
      case 'exercises': return 'Övningar';
      case 'equipment': return 'Utrustning';
      case 'gyms': return 'Gym';
      case 'unmapped-exercises': return 'Omatchade övningar';
      default: return 'Objekt';
    }
  }

  // Filtering
  const filteredExercises = exercises?.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold admin-header">Admin Dashboard</h1>
            <p className="text-muted-foreground">Hantera RepCompanion databas och system</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 animate-admin-fade">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2 p-1 border rounded-xl glass-panel">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300">Översikt</TabsTrigger>
            <TabsTrigger value="unmapped" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300 relative">
              Omatchade
              {unmapped && unmapped.length > 0 && (
                <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full shadow-lg border-2 border-background animate-pulse">
                  {unmapped.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="exercises" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300">Övningar</TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300">Utrustning</TabsTrigger>
            <TabsTrigger value="gyms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300">Gym</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-admin-fade delay-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="admin-card stat-card-gradient">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totalt antal användare</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold leading-tight tabular-nums">{stats?.usersCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% denna vecka</p>
                </CardContent>
              </Card>
              <Card className="admin-card stat-card-gradient">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Övningar i katalog</CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold leading-tight tabular-nums">{exercises?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Växande katalog</p>
                </CardContent>
              </Card>
              <Card className="admin-card stat-card-gradient border-destructive/20 bg-destructive/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Väntande matchningar</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive leading-tight tabular-nums">{unmapped?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Kräver uppmärksamhet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="unmapped" className="animate-admin-fade">
            <Card className="admin-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Omatchade övningar
                </CardTitle>
                <CardDescription>Övningar som AI:n föreslagit men som saknar koppling i databasen</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-muted/10 border-b flex justify-between items-center h-16">
                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-muted-foreground mr-2">
                          {selectedIds.length} markerade
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirm(`Ta bort ${selectedIds.length} omatchade övningar?`) && bulkDeleteMutation.mutate({ type: 'unmapped-exercises', ids: selectedIds })}
                          className="hover-elevate"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Radera markerade
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={unmapped && unmapped.length > 0 && unmapped.every(i => selectedIds.includes(i.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const allIds = unmapped?.map(i => i.id) || [];
                              setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                            } else {
                              const allIds = unmapped?.map(i => i.id) || [];
                              setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>AI Namn</TableHead>
                      <TableHead>Antal träffar</TableHead>
                      <TableHead>Senast sedd</TableHead>
                      <TableHead className="text-right">Åtgärd</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unmapped?.map((item) => (
                      <TableRow key={item.id} className="admin-table-row">
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={() => toggleId(item.id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">{item.aiName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background">{item.count} ggr</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(item.lastSeen).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => setMappingUnmapped(item)} className="hover-elevate">
                              <Check className="w-4 h-4 mr-2" /> Matcha
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => confirm("Ta bort omatchad övning?") && deleteMutation.mutate({ type: 'unmapped-exercises', id: item.id })}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!unmapped || unmapped.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Check className="w-8 h-8 text-primary" />
                            <p>Inga omatchade övningar just nu!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="animate-admin-fade">
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4 bg-muted/20 p-4 rounded-xl border glass-panel">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Sök övningar..." 
                    className="pl-9 bg-background border-none shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="hover-elevate shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" /> Ny övning
                </Button>
              </div>

              <Card className="admin-card overflow-hidden">
                <div className="p-4 bg-muted/10 border-b flex justify-between items-center h-16">
                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-muted-foreground mr-2">
                          {selectedIds.length} markerade
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirm(`Ta bort ${selectedIds.length} övningar?`) && bulkDeleteMutation.mutate({ type: 'exercises', ids: selectedIds })}
                          className="hover-elevate"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Radera markerade
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={filteredExercises && filteredExercises.length > 0 && filteredExercises.slice(0, 50).every(i => selectedIds.includes(i.id))}
                            onCheckedChange={(checked) => {
                              const slice = filteredExercises?.slice(0, 50) || [];
                              const sliceIds = slice.map(i => i.id);
                              if (checked) {
                                setSelectedIds(prev => Array.from(new Set([...prev, ...sliceIds])));
                              } else {
                                setSelectedIds(prev => prev.filter(id => !sliceIds.includes(id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Namn (SV)</TableHead>
                        <TableHead>Namn (EN)</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Utrustning</TableHead>
                        <TableHead>Video</TableHead>
                        <TableHead className="text-right">Åtgärder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExercises?.slice(0, 50).map((ex) => (
                        <TableRow key={ex.id} className="admin-table-row">
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.includes(ex.id)}
                              onCheckedChange={() => toggleId(ex.id)}
                            />
                          </TableCell>
                          <TableCell className="text-[10px] font-mono text-muted-foreground">
                            {ex.id.substring(0, 8)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            <div className="flex flex-col">
                              <span>{ex.name}</span>
                              {ex.aliases && ex.aliases.length > 0 && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  Alias: {ex.aliases.join(", ")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{ex.nameEn || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal capitalize">{ex.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {ex.requiredEquipment?.map((eq, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-4">{eq}</Badge>
                              )) || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {ex.youtubeUrl ? (
                              <a 
                                href={ex.youtubeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs flex items-center gap-1"
                              >
                                Länk
                              </a>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingEx(ex)} className="hover:bg-primary/10 hover:text-primary transition-colors">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirm("Ta bort övning?") && deleteMutation.mutate({ type: 'exercises', id: ex.id })} className="hover:bg-destructive/10 hover:text-destructive flex items-center h-8 w-8 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="animate-admin-fade">
             <Card className="admin-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Utrustningskatalog
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-muted/10 border-b flex justify-between items-center h-16">
                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-muted-foreground mr-2">
                          {selectedIds.length} markerade
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirm(`Ta bort ${selectedIds.length} utrustningsposter?`) && bulkDeleteMutation.mutate({ type: 'equipment', ids: selectedIds })}
                          className="hover-elevate"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Radera markerade
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={equipment && equipment.length > 0 && equipment.every(i => selectedIds.includes(i.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const allIds = equipment?.map(i => i.id) || [];
                              setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                            } else {
                              const allIds = equipment?.map(i => i.id) || [];
                              setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Namn (SV)</TableHead>
                      <TableHead>Namn (EN)</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead className="text-right">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment?.map((eq) => (
                      <TableRow key={eq.id} className="admin-table-row">
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(eq.id)}
                            onCheckedChange={() => toggleId(eq.id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex flex-col">
                            <span>{eq.name}</span>
                            {eq.aliases && eq.aliases.length > 0 && (
                              <span className="text-[10px] text-muted-foreground italic">
                                Alias: {eq.aliases.join(", ")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{eq.nameEn || "-"}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{eq.category}</Badge></TableCell>
                        <TableCell className="text-xs font-mono">{eq.equipmentKey}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditingEq(eq)} className="hover:bg-primary/10 hover:text-primary transition-colors">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirm("Ta bort utrustning?") && deleteMutation.mutate({ type: 'equipment', id: eq.id })} className="hover:bg-destructive/10 hover:text-destructive flex items-center h-8 w-8 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gyms" className="animate-admin-fade">
             <Card className="admin-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Alla registrerade gym
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-muted/10 border-b flex justify-between items-center h-16">
                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-muted-foreground mr-2">
                          {selectedIds.length} markerade
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirm(`Ta bort ${selectedIds.length} gym?`) && bulkDeleteMutation.mutate({ type: 'gyms', ids: selectedIds })}
                          className="hover-elevate"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Radera markerade
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={gyms && gyms.length > 0 && gyms.every(i => selectedIds.includes(i.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const allIds = gyms?.map(i => i.id) || [];
                              setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                            } else {
                              const allIds = gyms?.map(i => i.id) || [];
                              setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>Plats / Adress</TableHead>
                      <TableHead>Utrustning</TableHead>
                      <TableHead>Användare</TableHead>
                      <TableHead className="text-right">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gyms?.map((gym: any) => (
                      <TableRow key={gym.id} className="admin-table-row">
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(gym.id)}
                            onCheckedChange={() => toggleId(gym.id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold">{gym.name}</TableCell>
                        <TableCell className="text-xs">{gym.location || "Ej angivet"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {gym.equipmentCount} objekt
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{gym.userEmail || "Okänd"}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">{gym.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => confirm("Ta bort gym?") && deleteMutation.mutate({ type: 'gyms', id: gym.id })} className="hover:bg-destructive/10 hover:text-destructive flex items-center h-8 w-8 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Matching Dialog */}
      <Dialog open={!!mappingUnmapped} onOpenChange={() => setMappingUnmapped(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matcha AI-övning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">AI föreslog:</p>
              <p className="text-lg">{mappingUnmapped?.aiName}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Välj befintlig övning att koppla till:</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                onChange={(e) => setNewAlias(e.target.value)}
                value={newAlias}
              >
                <option value="">Välj övning...</option>
                {exercises?.map(ex => (
                  <option key={ex.id} value={ex.exerciseId || ""}>{ex.name} ({ex.exerciseId})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingUnmapped(null)}>Avbryt</Button>
            <Button 
              disabled={!newAlias || createAliasMutation.isPending}
              onClick={() => mappingUnmapped && createAliasMutation.mutate({ 
                exerciseId: newAlias, 
                alias: mappingUnmapped.aiName,
                lang: 'en' 
              })}
            >
              Skapa Alias & Koppla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editing Dialog */}
      {editingEx && (
        <Dialog open={!!editingEx} onOpenChange={() => setEditingEx(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Redigera övning</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Namn (SV)</label>
                <Input defaultValue={editingEx.name} id="edit-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Namn (EN)</label>
                <Input defaultValue={editingEx.nameEn || ""} id="edit-name-en" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Input defaultValue={editingEx.category} id="edit-category" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">V4 Exercise ID</label>
                <Input defaultValue={editingEx.exerciseId || ""} id="edit-v4-id" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Utrustning (kommaseparerad)</label>
                <Input defaultValue={editingEx.requiredEquipment?.join(", ") || ""} id="edit-equipment" placeholder="t.ex. barbell, bench" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">YouTube Video URL</label>
                <Input defaultValue={editingEx.youtubeUrl || ""} id="edit-video" placeholder="https://youtube.com/..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEx(null)}>Avbryt</Button>
              <Button onClick={() => {
                const name = (document.getElementById("edit-name") as HTMLInputElement).value;
                const nameEn = (document.getElementById("edit-name-en") as HTMLInputElement).value;
                const category = (document.getElementById("edit-category") as HTMLInputElement).value;
                const exerciseId = (document.getElementById("edit-v4-id") as HTMLInputElement).value;
                const equipmentRaw = (document.getElementById("edit-equipment") as HTMLInputElement).value;
                const youtubeUrl = (document.getElementById("edit-video") as HTMLInputElement).value;
                
                const requiredEquipment = equipmentRaw.split(",").map(s => s.trim()).filter(Boolean);
                
                updateExerciseMutation.mutate({ 
                  id: editingEx.id, 
                  data: { 
                    name, 
                    nameEn, 
                    category, 
                    exerciseId, 
                    requiredEquipment,
                    youtubeUrl: youtubeUrl || null
                  } 
                });
              }}>Spara ändringar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingEq && (
        <Dialog open={!!editingEq} onOpenChange={() => setEditingEq(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redigera utrustning</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Namn (SV)</label>
                <Input defaultValue={editingEq.name} id="edit-eq-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Namn (EN)</label>
                <Input defaultValue={editingEq.nameEn || ""} id="edit-eq-name-en" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Input defaultValue={editingEq.category} id="edit-eq-category" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment Key</label>
                <Input defaultValue={editingEq.equipmentKey || ""} id="edit-eq-key" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEq(null)}>Avbryt</Button>
              <Button onClick={() => {
                const name = (document.getElementById("edit-eq-name") as HTMLInputElement).value;
                const nameEn = (document.getElementById("edit-eq-name-en") as HTMLInputElement).value;
                const category = (document.getElementById("edit-eq-category") as HTMLInputElement).value;
                const equipmentKey = (document.getElementById("edit-eq-key") as HTMLInputElement).value;
                
                updateEquipmentMutation.mutate({ 
                  id: editingEq.id, 
                  data: { name, nameEn, category, equipmentKey } 
                });
              }}>Spara ändringar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
