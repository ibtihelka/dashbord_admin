import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { User } from 'src/app/demo/api/login.model';
import { MessageService } from 'primeng/api';
import { ComplementInfoService } from 'src/app/demo/service/complement-info.service';

interface DocumentBlock {
  label: string;     // Nom affiché
  type: string;      // Valeur fixe
  files: File[];     // Fichiers sélectionnés
}

@Component({
  selector: 'app-complement-information',
  templateUrl: './complement-information.component.html',
  styleUrls: ['./complement-information.component.scss'],
  providers: [MessageService]
})
export class ComplementInformationComponent implements OnInit {

  currentUser: User | null = null;

  documentBlocks: DocumentBlock[] = [
    { label: 'Extrait de naissance', type: 'EXTRAIT_NAISSANCE', files: [] },
    { label: 'Contrat de mariage', type: 'CONTRAT_MARIAGE', files: [] },
    { label: 'Attestation de scolarité ', type: 'ATTESTATION_SCOLARITE', files: [] }
  ];

  isLoading: boolean = false;

  constructor(
    public router: Router,
    private authService: AuthService,
    private complementInfoService: ComplementInfoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  onFileSelect(event: any, index: number): void {
    // PrimeNG FileUpload utilise event.currentFiles ou event.files
    const files = event.currentFiles || event.files || (event.target && event.target.files);
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Seuls les fichiers PDF sont acceptés' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Le fichier ${file.name} dépasse 5MB` });
        return;
      }
      validFiles.push(file);
    }

    this.documentBlocks[index].files = validFiles;
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: `${validFiles.length} fichier(s) sélectionné(s)` });
  }

  removeFile(blockIndex: number, fileIndex: number) {
    this.documentBlocks[blockIndex].files.splice(fileIndex, 1);
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Fichier supprimé' });
  }

  canSubmit(): boolean {
    // Activer si au moins un bloc a un fichier
    return this.documentBlocks.some(block => block.files.length > 0) && !this.isLoading;
  }

  hasFiles(): boolean {
    return this.documentBlocks.some(block => block.files.length > 0);
  }

  getTotalFiles(): number {
    return this.documentBlocks.reduce((sum, block) => sum + block.files.length, 0);
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non connecté' });
      return;
    }

    const formData = new FormData();
    formData.append('userPersoId', this.currentUser.persoId);
    formData.append('userName', this.currentUser.persoName || '');
    formData.append('userEmail', this.currentUser.persoId + '@temp.com');

    this.documentBlocks.forEach(block => {
      if (block.files.length > 0) {
        block.files.forEach(file => {
          formData.append('documentTypes', block.type);
          formData.append('files', file, file.name);
        });
      }
    });

    this.isLoading = true;

    this.complementInfoService.sendComplementInfo(formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Documents envoyés avec succès' });
        this.documentBlocks.forEach(block => block.files = []);
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/clients/accueil']), 2000);
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'envoi des documents' });
        this.isLoading = false;
      }
    });
  }
}