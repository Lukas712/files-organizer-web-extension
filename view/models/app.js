// Minimal UUID
const uid = () => Math.random().toString(36).slice(2,9);

class Node {
  constructor(type, data){
    this.id = data.id || uid();
    this.type = type; 
    this.name = data.name || (type==='folder' ? 'Nova pasta' : 'novo_arquivo');
    this.children = data.children || [];
    this.expanded = data.expanded ?? true;
    this.meta = data.meta || {};
  }
}

// Sample root
const root = new Node('folder', {
  id:'root',
  name:'root',
  children:[
    new Node('folder',{name:'src', children:[
      new Node('file',{name:'index.ts'}),
      new Node('folder',{name:'components'})
    ]}),
    new Node('file',{name:'README.md'})
  ]
});

// DOM refs
const treeRoot = document.getElementById('treeRoot');
const btnNewFolder = document.getElementById('btnNewFolder');
const btnNewFile = document.getElementById('btnNewFile');
const btnDelete = document.getElementById('btnDelete');

const noSelection = document.getElementById('noSelection');
const folderForm = document.getElementById('folderForm');
const fileForm = document.getElementById('fileForm');

const fldName = document.getElementById('fldName');
const fldEnabled = document.getElementById('fldEnabled');
const fldAutoOrg = document.getElementById('fldAutoOrg');
const fldConflict = document.getElementById('fldConflict');
const fldFileRules = document.getElementById('fldFileRules');

const fileExt = document.getElementById('fileExt');
const fileMime = document.getElementById('fileMime');
const fileRef = document.getElementById('fileRef');
const fileUrl = document.getElementById('fileUrl');
const fileFinalUrl = document.getElementById('fileFinalUrl');
const fileName = document.getElementById('fileName');
const fileDate = document.getElementById('fileDate');

const btnSave = document.getElementById('btnSave');

let selectedNode = null;
let parentMap = new Map();

function render(){
  parentMap = new Map();
  treeRoot.innerHTML = '';
  const frag = document.createDocumentFragment();
  renderNode(root, frag, null);
  treeRoot.appendChild(frag);
}

function renderNode(node, container, parent){
  parentMap.set(node.id, parent);

  const li = document.createElement('li');
  li.dataset.id = node.id;

  const disclosure = document.createElement('span');
  disclosure.className = 'disclosure';
  disclosure.innerText = node.type === 'folder' ? (node.expanded ? '▾' : '▸') : '';
  li.appendChild(disclosure);

  const label = document.createElement('div');
  label.className = 'label';
  label.innerHTML = `<span class="icon">${node.type==='folder'?'📁':'📄'}</span><span class="name">${escapeHtml(node.name)}</span>`;
  li.appendChild(label);

  disclosure.addEventListener('click', e=>{
    e.stopPropagation();
    if(node.type==='folder'){
      node.expanded = !node.expanded;
      render();
    }
  });

  label.addEventListener('click', e=>{
    e.stopPropagation();
    selectNode(node);
  });

  label.addEventListener('dblclick', ()=>{
    if(node.type==='folder'){
      node.expanded = !node.expanded;
      render();
    }
  });

  if(selectedNode && selectedNode.id === node.id){
    label.classList.add('selected');
  }

  container.appendChild(li);

  if(node.type==='folder' && node.expanded){
    const ul = document.createElement('ul');
    ul.className = 'node-children';
    for(const child of node.children){
      renderNode(child, ul, node);
    }
    container.appendChild(ul);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&\"<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]||c));
}

function selectNode(node){
  selectedNode = node;
  let p = parentMap.get(node.id);
  while(p){ p.expanded = true; p = parentMap.get(p.id); }
  render();
  populateForm(node);
}

function populateForm(node){
  noSelection.style.display = 'none';

  if(node.type === 'folder'){
    folderForm.style.display = '';
    fileForm.style.display = 'none';

    fldName.value = node.name;
    fldEnabled.checked = !!node.meta.enabled;
    fldAutoOrg.checked = !!node.meta.autoOrganize;
    fldConflict.value = node.meta.conflictAction || '';
    fldFileRules.value = JSON.stringify(node.meta.fileRules || [], null, 2);

  } else {
    folderForm.style.display = 'none';
    fileForm.style.display = '';

    fileExt.value = node.meta.extension || '';
    fileMime.value = node.meta.mime || '';
    fileRef.value = node.meta.referrer || '';
    fileUrl.value = node.meta.url || '';
    fileFinalUrl.value = node.meta.finalUrl || '';
    fileName.value = node.name || node.meta.fileName || '';

    if(node.meta.dateTime){
      const d = new Date(node.meta.dateTime);
      fileDate.value = d.toISOString().slice(0,16);
    } else fileDate.value = '';
  }
}

function createFolder(){
  const base = selectedNode && selectedNode.type==='folder' ? selectedNode : root;
  const f = new Node('folder',{name:'Nova pasta'});
  base.children.push(f);
  render();
  selectNode(f);
}

function createFile(){
  const base = selectedNode && selectedNode.type==='folder' ? selectedNode : root;
  const f = new Node('file',{name:''});
  base.children.push(f);
  render();
  selectNode(f);
}

function deleteSelected(){
  if(!selectedNode || selectedNode.id === root.id) return;
  const parent = parentMap.get(selectedNode.id);
  if(!parent) return;

  parent.children = parent.children.filter(c=>c.id !== selectedNode.id);
  selectedNode = null;

  render();
  showNoSelection();
}

function showNoSelection(){
  noSelection.style.display = '';
  folderForm.style.display = 'none';
  fileForm.style.display = 'none';
}

function saveChanges(){
  if(!selectedNode) return;

  if(selectedNode.type==='folder'){
    selectedNode.name = fldName.value || selectedNode.name;
    selectedNode.meta.enabled = fldEnabled.checked;
    selectedNode.meta.autoOrganize = fldAutoOrg.checked;
    selectedNode.meta.conflictAction = fldConflict.value || undefined;

    try{
      selectedNode.meta.fileRules = JSON.parse(fldFileRules.value || '[]');
    }catch(e){
      alert('JSON inválido em Regras de Arquivo');
      return;
    }

  } else {
    selectedNode.meta.extension = fileExt.value || undefined;
    selectedNode.meta.mime = fileMime.value || undefined;
    selectedNode.meta.referrer = fileRef.value || undefined;
    selectedNode.meta.url = fileUrl.value || undefined;
    selectedNode.meta.finalUrl = fileFinalUrl.value || undefined;
    selectedNode.name = fileName.value || selectedNode.name;
    selectedNode.meta.fileName = fileName.value || undefined;
    selectedNode.meta.dateTime = fileDate.value ? new Date(fileDate.value).toISOString() : undefined;
  }

  render();
  console.log('Salvo:', cloneModel(root));
  alert('Alterações salvas (veja console).');
}

function cloneModel(node){
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    meta: JSON.parse(JSON.stringify(node.meta)),
    children: node.children.map(c=>cloneModel(c))
  };
}

btnNewFolder.addEventListener('click', createFolder);
btnNewFile.addEventListener('click', createFile);
btnDelete.addEventListener('click', deleteSelected);
btnSave.addEventListener('click', saveChanges);

render();
showNoSelection();

window.addEventListener('keydown', e=>{
  if(e.key === 'Delete') deleteSelected();
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='s'){
    e.preventDefault();
    saveChanges();
  }
});
