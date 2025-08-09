export class Client {
    private nom: string;
    private prenom: string;
    private telephone: string;
    private adresse: string;
    private email?: string;

    constructor(nom: string, prenom: string, telephone: string, adresse: string, email?: string) {
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.adresse = adresse;
        this.email = email;
    }

    public getNomComplet(): string {
        return `${this.prenom} ${this.nom}`;
    }

    public getNom(): string {
        return this.nom;
    }

    public getPrenom(): string {
        return this.prenom;
    }

    public getTelephone(): string {
        return this.telephone;
    }

    public getAdresse(): string {
        return this.adresse;
    }

    public getEmail(): string | undefined {
        return this.email;
    }
}
