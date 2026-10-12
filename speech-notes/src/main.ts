import { defineCustomElements } from '@ionic/core/loader';
defineCustomElements(window);

import '@ionic/core/css/core.css';
import '@ionic/core/css/normalize.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';
import '@ionic/core/css/padding.css';
import '@ionic/core/css/flex-utils.css';
import '@ionic/core/css/display.css';
import './theme.css'

import { alertController } from '@ionic/core';
import { addIcons } from 'ionicons';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import {
  mic, stop, search, trash, personCircle, folderOpenOutline, chevronBack,
  add, closeCircle, folderOutline, banOutline, checkmarkCircle,
} from 'ionicons/icons';
addIcons({
  mic, stop, search, trash, personCircle, folderOpenOutline, chevronBack,
  add, closeCircle, folderOutline, banOutline, checkmarkCircle,
});

interface Folder {
  id: number;
  name: string;
}

interface Note {
  id: number;
  text: string;
  folderId?: number | null;
}

const KEY = 'notes';
const FOLDERS_KEY = 'folders';

let notes: Note[] = [];
let folders: Folder[] = [];
let recording = false;
let editingId: number | null = null;
let activeFolderId: number | null = null; // folder filter in the notes list
let pickedFolder: number | null = null; // folder chosen in the editor

const btn = document.getElementById('record-btn') as HTMLIonButtonElement;
const label = document.getElementById('record-label')!;
const icon = btn.querySelector('ion-icon') as HTMLIonIconElement;
const live = document.getElementById('live-text')!;
const list = document.getElementById('notes-list')!;
const draft = document.getElementById('draft') as HTMLIonTextareaElement;
const folderPicker = document.getElementById('folder-picker')!;
const foldersGrid = document.getElementById('folders-grid')!;
const foldersEmpty = document.getElementById('folders-empty')!;
const filterBar = document.getElementById('filter-bar')!;
const filterLabel = document.getElementById('filter-label')!;
const recordFab = document.getElementById('record-fab')!;
const folderFab = document.getElementById('folder-fab')!;

let openNote: Note | null = null;

const segment = document.getElementById('view-segment') as HTMLIonSegmentElement;
const notesView = document.getElementById('notes-view')!;
const foldersView = document.getElementById('folders-view')!;
const detailView = document.getElementById('detail-view')!;
const segmentToolbar = document.querySelector('.segment-toolbar')!;

function showView(view: 'notes' | 'folders' | 'detail') {
  notesView.classList.toggle('ion-hide', view !== 'notes');
  foldersView.classList.toggle('ion-hide', view !== 'folders');
  detailView.classList.toggle('ion-hide', view !== 'detail');
  segmentToolbar.classList.toggle('ion-hide', view === 'detail');
  // folders tab: "Lisa kaust" button instead of the record button
  recordFab.classList.toggle('ion-hide', view === 'folders');
  folderFab.classList.toggle('ion-hide', view !== 'folders');
}

segment.addEventListener('ionChange', (ev: any) => {
  showView(ev.detail.value === 'folders' ? 'folders' : 'notes');
});

// Tapping "Kõik märkused" always clears the folder filter
document.getElementById('seg-notes')!.addEventListener('click', () => {
  setFilter(null);
});

/* ---------- Folders ---------- */

function folderName(id: number | null | undefined): string | null {
  if (id == null) return null;
  return folders.find((f) => f.id === id)?.name ?? null;
}

async function saveFolders() {
  await Preferences.set({ key: FOLDERS_KEY, value: JSON.stringify(folders) });
}

// Folder picker in the editor: a row of chips, selected one is solid black
function populateFolderSelect(selected: number | null) {
  pickedFolder = selected !== null && folderName(selected) ? selected : null;
  renderFolderPicker();
}

function renderFolderPicker() {
  folderPicker.innerHTML = '';

  const makeChip = (id: number | null, text: string) => {
    const selected = pickedFolder === id;
    const chip = document.createElement('ion-chip');
    chip.className =
      'folder-chip' + (id === null ? ' folder-chip-none' : '') + (selected ? ' selected' : '');

    const ic = document.createElement('ion-icon');
    ic.setAttribute(
      'name',
      selected ? 'checkmark-circle' : id === null ? 'ban-outline' : 'folder-outline'
    );
    const lbl = document.createElement('ion-label');
    lbl.textContent = text;

    chip.append(ic, lbl);
    chip.addEventListener('click', () => {
      pickedFolder = id;
      renderFolderPicker();
    });
    folderPicker.appendChild(chip);
  };

  makeChip(null, 'Kaust puudub');
  for (const f of folders) makeChip(f.id, f.name);

  // "+ Uus kaust": create a folder right from the editor and select it
  const addChip = document.createElement('ion-chip');
  addChip.className = 'folder-chip folder-chip-add';
  const addIcon = document.createElement('ion-icon');
  addIcon.setAttribute('name', 'add');
  const addLbl = document.createElement('ion-label');
  addLbl.textContent = 'Uus kaust';
  addChip.append(addIcon, addLbl);
  addChip.addEventListener('click', () => folderDialog(undefined, true));
  folderPicker.appendChild(addChip);
}

function selectedFolderId(): number | null {
  return pickedFolder;
}

function setFilter(id: number | null) {
  activeFolderId = id;
  const name = folderName(id);
  filterBar.classList.toggle('ion-hide', name === null);
  filterLabel.textContent = name ?? '';
  render();
}

function openFolder(f: Folder) {
  setFilter(f.id);
  segment.value = 'notes';
  showView('notes');
  if (editingId === null) populateFolderSelect(f.id);
}

document.getElementById('filter-chip')!.addEventListener('click', () => {
  setFilter(null);
});

async function folderDialog(existing?: Folder, pickAfterCreate = false) {
  const alert = await alertController.create({
    header: existing ? 'Muuda kausta' : 'Uus kaust',
    inputs: [
      {
        name: 'name',
        type: 'text',
        value: existing?.name ?? '',
        placeholder: 'Kausta nimi',
        attributes: { maxlength: 30 },
      },
    ],
    buttons: [
      { text: 'Tühista', role: 'cancel' },
      {
        text: 'Salvesta',
        role: 'confirm',
        handler: (value: { name: string }) => {
          const name = (value.name ?? '').trim();
          if (!name) return false; // keep dialog open
          if (existing) {
            existing.name = name;
          } else {
            const created = { id: Date.now(), name };
            folders.push(created);
            if (pickAfterCreate) pickedFolder = created.id;
          }
          saveFolders();
          renderFolders();
          populateFolderSelect(selectedFolderId());
          if (activeFolderId !== null) setFilter(activeFolderId);
          render();
          return true;
        },
      },
    ],
  });
  await alert.present();
}

async function deleteFolder(f: Folder) {
  const count = notes.filter((n) => n.folderId === f.id).length;
  const alert = await alertController.create({
    header: 'Kustuta kaust?',
    message:
      count > 0
        ? `Kaustas "${f.name}" on ${count} märget. Märkmed jäävad alles, aga kaust eemaldatakse.`
        : `Kaust "${f.name}" kustutatakse.`,
    buttons: [
      { text: 'Tühista', role: 'cancel' },
      {
        text: 'Kustuta',
        role: 'destructive',
        handler: async () => {
          folders = folders.filter((x) => x.id !== f.id);
          notes = notes.map((n) => (n.folderId === f.id ? { ...n, folderId: null } : n));
          if (activeFolderId === f.id) setFilter(null);
          await Promise.all([saveFolders(), save()]);
          populateFolderSelect(selectedFolderId());
          renderFolders();
          render();
        },
      },
    ],
  });
  await alert.present();
}

function renderFolders() {
  foldersGrid.innerHTML = '';
  foldersEmpty.classList.toggle('ion-hide', folders.length > 0);
  for (const f of folders) {
    const count = notes.filter((n) => n.folderId === f.id).length;

    const card = document.createElement('ion-card');
    card.className = 'folder-card';
    card.addEventListener('click', () => openFolder(f));

    const content = document.createElement('ion-card-content');
    const ic = document.createElement('ion-icon');
    ic.setAttribute('name', 'folder-outline');
    const title = document.createElement('h3');
    title.textContent = f.name;
    const meta = document.createElement('ion-note');
    meta.textContent = `${count} märget`;

    const actions = document.createElement('div');
    actions.className = 'note-actions folder-actions';
    const edit = document.createElement('ion-button');
    edit.setAttribute('fill', 'clear');
    edit.setAttribute('size', 'small');
    edit.textContent = 'Muuda';
    edit.addEventListener('click', (ev) => {
      ev.stopPropagation();
      folderDialog(f);
    });
    const del = document.createElement('ion-button');
    del.setAttribute('fill', 'clear');
    del.setAttribute('size', 'small');
    del.textContent = 'Kustuta';
    del.addEventListener('click', (ev) => {
      ev.stopPropagation();
      deleteFolder(f);
    });
    actions.append(edit, del);

    content.append(ic, title, meta, actions);
    card.append(content);
    foldersGrid.appendChild(card);
  }
}

document.getElementById('add-folder-btn')!.addEventListener('click', () => folderDialog());

/* ---------- Notes ---------- */

async function editNote(n: Note) {
  editingId = n.id;
  draft.value = n.text;
  populateFolderSelect(n.folderId ?? null);
  await document.querySelector('ion-content')!.scrollToTop(200);
  draft.setFocus();
}

function deleteNote(n: Note) {
  notes = notes.filter((x) => x.id !== n.id);
  save();
  render();
  renderFolders();
}

function openDetail(n: Note) {
  openNote = n;
  const firstLine = n.text.split(/[.!?\n]/)[0].trim();
  document.getElementById('detail-title')!.textContent =
    firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine;
  document.getElementById('detail-created')!.textContent = new Date(n.id).toLocaleString('et-EE');
  document.getElementById('detail-folder')!.textContent = folderName(n.folderId) ?? '—';
  document.getElementById('detail-length')!.textContent = `${n.text.split(/\s+/).length} sõna`;
  document.getElementById('detail-text')!.textContent = n.text;
  showView('detail');
}

document.getElementById('modal-back')!.addEventListener('click', () => showView('notes'));
document.getElementById('detail-edit')!.addEventListener('click', () => {
  showView('notes');
  if (openNote) editNote(openNote);
});
document.getElementById('detail-delete')!.addEventListener('click', () => {
  showView('notes');
  if (openNote) deleteNote(openNote);
});

function render() {
  list.innerHTML = '';
  const visible =
    activeFolderId === null ? notes : notes.filter((n) => n.folderId === activeFolderId);

  if (visible.length === 0 && activeFolderId !== null) {
    const empty = document.createElement('p');
    empty.className = 'list-empty';
    empty.textContent = 'Selles kaustas pole märkmeid.';
    list.appendChild(empty);
    return;
  }

  for (const n of visible) {
    const card = document.createElement('ion-card');
    card.className = 'note-card';
    card.addEventListener('click', () => openDetail(n));

    const content = document.createElement('ion-card-content');
    const date = document.createElement('ion-note');
    const fName = folderName(n.folderId);
    const dateStr = new Date(n.id).toLocaleDateString('et-EE', { day: '2-digit', month: 'short' });
    date.textContent = fName ? `${dateStr} · ${fName}` : dateStr;

    const text = document.createElement('p');
    text.textContent = n.text;
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    const edit = document.createElement('ion-button');
    edit.setAttribute('fill', 'clear');
    edit.setAttribute('size', 'small');
    edit.textContent = 'Muuda';
    edit.addEventListener('click', (ev) => {
      ev.stopPropagation();
      editNote(n);
    });
    const del = document.createElement('ion-button');
    del.setAttribute('fill', 'clear');
    del.setAttribute('size', 'small');
    del.textContent = 'Kustuta';
    del.addEventListener('click', (ev) => {
      ev.stopPropagation();
      deleteNote(n);
    });
    actions.append(edit, del);
    content.append(date, text, actions);
    card.append(content);
    list.appendChild(card);
  }
}
async function save() {
  await Preferences.set({ key: KEY, value: JSON.stringify(notes) });
}

function isNotes(x: unknown): x is Note[] {
  return Array.isArray(x) && x.every(
    (n) => typeof n?.id === 'number' && typeof n?.text === 'string'
  );
}

function isFolders(x: unknown): x is Folder[] {
  return Array.isArray(x) && x.every(
    (f) => typeof f?.id === 'number' && typeof f?.name === 'string'
  );
}

async function load() {
  const [n, f] = await Promise.all([
    Preferences.get({ key: KEY }),
    Preferences.get({ key: FOLDERS_KEY }),
  ]);
  try {
    const data: unknown = n.value ? JSON.parse(n.value) : [];
    notes = isNotes(data) ? data : [];
  } catch {
    notes = [];
  }
  try {
    const data: unknown = f.value ? JSON.parse(f.value) : [];
    folders = isFolders(data) ? data : [];
  } catch {
    folders = [];
  }
  populateFolderSelect(null);
  render();
  renderFolders();
}

function setRecording(on: boolean) {
  recording = on;
  label.textContent = on ? 'Peata' : 'Räägi märkus';
  icon.name = on ? 'stop' : 'mic';
  btn.color = on ? 'danger' : 'primary';
}

// Brauseri Web Speech API (ainult testimiseks, Chrome/Edge)
let webRec: any = null;

function startWeb() {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) {
    live.textContent = 'Brauser ei toeta kõnetuvastust';
    return;
  }
  live.textContent = '';
  draft.value = '';
  editingId = null;
  populateFolderSelect(activeFolderId);
  webRec = new Ctor();
  webRec.lang = 'et-EE';
  webRec.continuous = true;
  webRec.interimResults = true;
  webRec.onresult = (e: any) => {
    draft.value = Array.from(e.results as ArrayLike<any>)
      .map((r) => r[0].transcript)
      .join(' ');
  };
  webRec.onerror = (e: any) => {
    live.textContent = 'Viga: ' + e.error;
    setRecording(false);
  };
  webRec.onend = () => setRecording(false);
  webRec.start();
  setRecording(true);
}

async function start() {
  if (!Capacitor.isNativePlatform()) return startWeb();
  const { available } = await SpeechRecognition.available();
  if (!available) {
    live.textContent = 'Kõnetuvastus pole saadaval';
    return;
  }
  const perm = await SpeechRecognition.requestPermissions();
  if (perm.speechRecognition !== 'granted') {
    live.textContent = 'Luba puudub';
    return;
  }
  live.textContent = '';
  draft.value = '';
  editingId = null;
  populateFolderSelect(activeFolderId);
  await SpeechRecognition.removeAllListeners();
  await SpeechRecognition.addListener('partialResults', (data) => {
    draft.value = data.matches?.[0] ?? '';
  });
  await SpeechRecognition.addListener('listeningState', (data) => {
    if (data.status === 'stopped') setRecording(false);
  });
  setRecording(true);
  try {
    await SpeechRecognition.start({
      language: 'et-EE',
      partialResults: true,
      popup: false,
    });
  } catch (e: any) {
    live.textContent = 'Viga: ' + (e?.message ?? e);
    setRecording(false);
  }
}

async function stopRecording() {
  setRecording(false);
  try {
    if (Capacitor.isNativePlatform()) {
      // Pluginaga stop() kutsel puudub resolve(), seega ei tohi seda lõputult oodata
      await Promise.race([
        SpeechRecognition.stop(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } else {
      webRec?.stop();
    }
  } catch (e: any) {
    live.textContent = 'Viga: ' + (e?.message ?? e);
  }
}

async function saveDraft() {
  const text = (draft.value ?? '').trim();
  if (!text) return;
  const folderId = selectedFolderId();
  if (editingId !== null) {
    notes = notes.map((n) => (n.id === editingId ? { ...n, text, folderId } : n));
  } else {
    notes.unshift({ id: Date.now(), text, folderId });
  }
  editingId = null;
  draft.value = '';
  populateFolderSelect(activeFolderId);
  await save();
  render();
  renderFolders();
}

btn.addEventListener('click', () => (recording ? stopRecording() : start()));
document.getElementById('save-btn')!.addEventListener('click', saveDraft);
document.getElementById('cancel-btn')!.addEventListener('click', () => {
  editingId = null;
  draft.value = '';
  populateFolderSelect(activeFolderId);
});

document.getElementById('clear-btn')!.addEventListener('click', async () => {
  notes = [];
  await save();
  render();
  renderFolders();
});

load();