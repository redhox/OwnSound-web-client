

import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { AlertCircle, Check, Copy, Shield, RefreshCw, Database, Save, X, Key, Image as ImageIcon } from "lucide-react";
import { fetchLibraries, updateLibrary, createLibrary, fetchGenerateToken, scanBucket, scanArtistImages } from "../api/user";

export default function AdminSettingsView() {
  const { token, user } = useAuth();
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [isLoadingToken, setIsLoadingToken] = useState(false); // Renamed for clarity
  const [tokenError, setTokenError] = useState(""); // Renamed for clarity
  const [copied, setCopied] = useState(false);

  // Libraries state
  const [libraries, setLibraries] = useState<any[]>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libSuccess, setLibSuccess] = useState("");
  const [libError, setLibError] = useState("");

  // State for adding a new library
  const [showAddLibraryForm, setShowAddLibraryForm] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState("");
  const [newLibraryType, setNewLibraryType] = useState("bucket"); // Default type
  const [newLibraryConfig, setNewLibraryConfig] = useState<any>({ // Default config for bucket
    bucket_name: "",
    aws_endpoint_url: "",
    aws_access_key_id: "",
    aws_secret_access_key: "",
    url_expiration: 3600,
    bucket_host: ""
  });

  // State for bucket scan results
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanError, setScanError] = useState("");

  // State for artist image scan results
  const [isScanningArtist, setIsScanningArtist] = useState(false);
  const [artistScanResults, setArtistScanResults] = useState<any>(null);
  const [artistScanError, setArtistScanError] = useState("");

  useEffect(() => {
    if (token) {
      loadLibraries();
    }
  }, [token]);

  const loadLibraries = async () => {
    setLibLoading(true);
    try {
      const data = await fetchLibraries(token!);
      setLibraries(data.libraries || []);
    } catch (err: any) {
      setLibError("Échec du chargement des librairies.");
    } finally {
      setLibLoading(false);
    }
  };

  const handleUpdateLibrary = async (index: number) => {
    setLibLoading(true);
    setLibSuccess("");
    setLibError("");
    try {
      await updateLibrary(token!, index, libraries[index]);
      setLibSuccess("Librairie mise à jour avec succès !");
      setTimeout(() => setLibSuccess(""), 3000);
    } catch (err: any) {
      setLibError("Échec de la mise à jour.");
    } finally {
      setLibLoading(false);
    }
  };

  const handleConfigChange = (libIndex: number, field: string, value: any) => {
    const newLibs = [...libraries];
    newLibs[libIndex] = {
      ...newLibs[libIndex],
      config: {
        ...newLibs[libIndex].config,
        [field]: value
      }
    };
    setLibraries(newLibs);
  };

  // Handler for new library config changes
  const handleNewLibraryConfigChange = (field: string, value: any) => {
    setNewLibraryConfig(prevConfig => ({
      ...prevConfig,
      [field]: value
    }));
  };

  // Handler to add a new library
  const handleAddLibrary = async () => {
    setLibLoading(true);
    setLibSuccess("");
    setLibError("");
    try {
      await createLibrary(token!, {
        name: newLibraryName,
        type: newLibraryType,
        config: newLibraryConfig
      });
      setLibSuccess("Nouvelle librairie ajoutée avec succès !");
      setTimeout(() => setLibSuccess(""), 3000);
      
      // Reset form and hide it
      setNewLibraryName("");
      setNewLibraryType("bucket");
      setNewLibraryConfig({
        bucket_name: "",
        aws_endpoint_url: "",
        aws_access_key_id: "",
        aws_secret_access_key: "",
        url_expiration: 3600,
        bucket_host: ""
      });
      setShowAddLibraryForm(false);
      
      loadLibraries(); // Refresh list
    } catch (err: any) {
      setLibError("Échec de l'ajout de la librairie.");
    } finally {
      setLibLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    setIsLoadingToken(true); // Use renamed state
    setTokenError(""); // Use renamed state
    setGeneratedToken("");
    try {
      const data = await fetchGenerateToken(token!);
      setGeneratedToken(data.token || data.registration_token || ""); // Ensure it's set even if message is empty
      if (!data.token && !data.registration_token) {
         setTokenError("Erreur: Aucun token retourné par le serveur."); // Use renamed state
      }
    } catch (err: any) {
      setTokenError(`Erreur lors de la génération: ${err.message}`); // Use renamed state
    } finally {
      setIsLoadingToken(false); // Use renamed state
    }
  };

  const copyToClipboard = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle bucket scan
  const handleScanBucket = async (libraryId?: number) => {
    console.log("AdminSettingsView: Requesting scan for libraryId:", libraryId);
    setIsScanning(true);
    setScanError("");
    setScanResults(null);
    try {
      const data = await scanBucket(token!, libraryId);
      setScanResults(data);
      // Optionally, auto-refresh libraries list after scan
      loadLibraries(); 
    } catch (err: any) {
      setScanError(`Échec du scan du bucket: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanArtistImages = async () => {
    setIsScanningArtist(true);
    setArtistScanError("");
    setArtistScanResults(null);
    try {
      const data = await scanArtistImages(token!);
      setArtistScanResults(data);
    } catch (err: any) {
      setArtistScanError(`Échec du scan des images: ${err.message}`);
    } finally {
      setIsScanningArtist(false);
    }
  };


  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive font-bold">Accès refusé. Réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500 pt-6 pb-32">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres Administrateur</h2>
        <p className="text-muted-foreground">Outils de gestion système, invitations et sources de données.</p>
      </div>

      <div className="grid gap-6">
        {/* Invitation Token Section */}
        <Card className="border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/40">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Invitation Utilisateur
            </CardTitle>
            <CardDescription>
              Générez un jeton d'inscription à usage unique pour permettre à un nouvel utilisateur de créer son compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleGenerateToken} 
                  disabled={isLoadingToken}
                  className="gap-2 rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingToken ? "animate-spin" : ""}`} />
                  Générer un jeton
                </Button>
              </div>

              {generatedToken && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-muted-foreground">Jeton d'inscription généré :</p>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/40 font-mono text-sm break-all relative group">
                    <span className="flex-1">{generatedToken}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={copyToClipboard}
                      className="shrink-0 h-8 w-8"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Ce jeton est confidentiel et permet l'accès à la création de compte.
                  </p>
                </div>
              )}

              {tokenError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 shrink-0" />
                  {tokenError}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 border-t border-border/40 text-[11px] text-muted-foreground">
            Note: Les jetons expirent généralement après une utilisation ou une période définie par le serveur.
          </CardFooter>
        </Card>

        {/* Libraries management section */}
        <div className="grid gap-6 mt-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold tracking-tight">Gestion des Librairies</h3>
            <p className="text-muted-foreground">Configurez les sources de données et les buckets S3.</p>
          </div>
          
          {/* Button to show Add Library Form */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowAddLibraryForm(true)} 
              disabled={showAddLibraryForm || libLoading}
              className="gap-2 rounded-full"
            >
              <Database className="w-4 h-4" />
              Ajouter une nouvelle librairie
            </Button>
          </div>

          {/* Add Library Form */}
          {showAddLibraryForm && (
            <Card className="border-border/40 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/40">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" /> Nouvelle Librairie
                    </CardTitle>
                    <CardDescription>
                      Entrez les détails de la nouvelle librairie.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddLibraryForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nom de la Librairie</label>
                    <Input 
                      value={newLibraryName} 
                      onChange={(e) => setNewLibraryName(e.target.value)}
                      placeholder="Ex: Mon Bucket perso"
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</label>
                    <Select onValueChange={(val) => {
                      setNewLibraryType(val);
                      // Reset config to defaults based on new type if needed
                      if (val === "bucket") {
                        setNewLibraryConfig({
                          bucket_name: "",
                          aws_endpoint_url: "",
                          aws_access_key_id: "",
                          aws_secret_access_key: "",
                          url_expiration: 3600,
                          bucket_host: ""
                        });
                      } else {
                        setNewLibraryConfig({}); // Clear for other types
                      }
                    }} defaultValue={newLibraryType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bucket">Bucket S3</SelectItem>
                        {/* Add other types if supported */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Config fields for bucket type */}
                  {newLibraryType === "bucket" && (
                    <>
                      <div className="space-y-2"> {/* Bucket Name */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bucket Name</label>
                        <Input 
                          value={newLibraryConfig.bucket_name} 
                          onChange={(e) => handleNewLibraryConfigChange("bucket_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2"> {/* Endpoint URL */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Endpoint URL</label>
                        <Input 
                          value={newLibraryConfig.aws_endpoint_url} 
                          onChange={(e) => handleNewLibraryConfigChange("aws_endpoint_url", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2"> {/* Access Key ID */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Access Key ID</label>
                        <Input 
                          value={newLibraryConfig.aws_access_key_id} 
                          onChange={(e) => handleNewLibraryConfigChange("aws_access_key_id", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2"> {/* Secret Access Key */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Secret Access Key</label>
                        <Input 
                          type="password"
                          value={newLibraryConfig.aws_secret_access_key} 
                          onChange={(e) => handleNewLibraryConfigChange("aws_secret_access_key", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2"> {/* Bucket Host */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bucket Host (URL publique)</label>
                        <Input 
                          value={newLibraryConfig.bucket_host} 
                          onChange={(e) => handleNewLibraryConfigChange("bucket_host", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2"> {/* Expiration URL */}
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expiration URL (secondes)</label>
                        <Input 
                          type="number"
                          value={newLibraryConfig.url_expiration} 
                          onChange={(e) => handleNewLibraryConfigChange("url_expiration", parseInt(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                  {/* Add config fields for other types if needed */}
                </div>
                
                {libSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {libSuccess}
                  </div>
                )}
                {libError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {libError}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/5 border-t border-border/40 py-3">
                <Button 
                  onClick={handleAddLibrary} 
                  disabled={libLoading || !newLibraryName || !newLibraryType || (newLibraryType === "bucket" && (!newLibraryConfig.bucket_name || !newLibraryConfig.aws_endpoint_url))} // Basic validation
                  className="gap-2 ml-auto rounded-full"
                >
                  <Save className="w-4 h-4" />
                  {libLoading ? "Ajout..." : "Ajouter"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Existing Libraries */}
          {libLoading && libraries.length === 0 ? (
            <div className="flex items-center justify-center p-12">
               <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : (
            libraries.map((lib, idx) => (
              <Card key={idx} className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-border/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" /> {lib.name}
                      </CardTitle>
                      <CardDescription>
                        Configuration de type <strong>{lib.type}</strong>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {lib.type === "bucket" && (
                    <div className="grid grid-cols-1 md:grid-grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bucket Name</label>
                        <Input 
                          value={lib.config.bucket_name} 
                          onChange={(e) => handleConfigChange(idx, "bucket_name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Endpoint URL</label>
                        <Input 
                          value={lib.config.aws_endpoint_url} 
                          onChange={(e) => handleConfigChange(idx, "aws_endpoint_url", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Access Key ID</label>
                        <Input 
                          value={lib.config.aws_access_key_id} 
                          onChange={(e) => handleConfigChange(idx, "aws_access_key_id", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Secret Access Key</label>
                        <Input 
                          type="password"
                          value={lib.config.aws_secret_access_key} 
                          onChange={(e) => handleConfigChange(idx, "aws_secret_access_key", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bucket Host (URL publique)</label>
                        <Input 
                          value={lib.config.bucket_host} 
                          onChange={(e) => handleConfigChange(idx, "bucket_host", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expiration URL (secondes)</label>
                        <Input 
                          type="number"
                          value={lib.config.url_expiration} 
                          onChange={(e) => handleConfigChange(idx, "url_expiration", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Display success/error messages related to updates */}
                  {libSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {libSuccess}
                    </div>
                  )}
                  {libError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {libError}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/5 border-t border-border/40 py-3 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => handleScanBucket(lib.id)} 
                    disabled={isScanning || libLoading}
                    className="gap-2 rounded-full"
                  >
                    <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
                    Scanner
                  </Button>
                  <Button 
                    onClick={() => handleUpdateLibrary(idx)} 
                    disabled={libLoading}
                    className="gap-2 rounded-full"
                  >
                    <Save className="w-4 h-4" />
                    {libLoading ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}

          {/* Bucket Scan Section */}
          <Card className="border-border/40 shadow-sm overflow-hidden mt-8">
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className={`w-5 h-5 text-primary ${isScanning ? "animate-spin" : ""}`} /> 
                Synchronisation S3
              </CardTitle>
              <CardDescription>
                Scanner les buckets configurés pour importer de nouveaux titres et albums.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => handleScanBucket()} 
                  disabled={isScanning}
                  className="gap-2 w-fit rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
                  {isScanning ? "Scan en cours..." : "Lancer le scan de TOUTES les librairies"}
                </Button>

                {scanResults && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2 animate-in fade-in duration-300">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> Scan terminé avec succès
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-background rounded border border-border/40">
                        <span className="block font-bold text-lg">{scanResults.artists_added}</span>
                        <span className="text-muted-foreground">Artistes ajoutés</span>
                      </div>
                      <div className="p-2 bg-background rounded border border-border/40">
                        <span className="block font-bold text-lg">{scanResults.albums_added}</span>
                        <span className="text-muted-foreground">Albums ajoutés</span>
                      </div>
                      <div className="p-2 bg-background rounded border border-border/40">
                        <span className="block font-bold text-lg">{scanResults.tracks_added}</span>
                        <span className="text-muted-foreground">Titres ajoutés</span>
                      </div>
                    </div>
                  </div>
                )}

                {scanError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {scanError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Artist Image Scan Section */}
          <Card className="border-border/40 shadow-sm overflow-hidden mt-8">
            <CardHeader className="bg-primary/5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className={`w-5 h-5 text-primary ${isScanningArtist ? "animate-pulse" : ""}`} /> 
                Images d'Artistes (Discogs)
              </CardTitle>
              <CardDescription>
                Rechercher des photos d'artistes sur Discogs pour ceux qui n'en ont pas.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/40 text-sm text-muted-foreground">
                  <p>Cette opération peut prendre du temps car elle respecte les limites de l'API Discogs (1 artiste par seconde).</p>
                </div>
                
                <Button 
                  onClick={handleScanArtistImages} 
                  disabled={isScanningArtist}
                  className="gap-2 w-fit rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanningArtist ? "animate-spin" : ""}`} />
                  {isScanningArtist ? "Scan des images en cours..." : "Lancer le scan des images"}
                </Button>

                {artistScanResults && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2 animate-in fade-in duration-300">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> Scan des images terminé
                    </p>
                    <div className="p-2 bg-background rounded border border-border/40 w-fit">
                      <span className="block font-bold text-lg">{artistScanResults.updated_count}</span>
                      <span className="text-muted-foreground text-xs">Images mises à jour</span>
                    </div>
                  </div>
                )}

                {artistScanError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {artistScanError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
