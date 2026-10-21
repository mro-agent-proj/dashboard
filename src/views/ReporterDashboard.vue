<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import AppShell from '../layouts/AppShell.vue';
import PageHeader from '../components/ui/PageHeader.vue';
import RequestComposer from '../components/RequestComposer.vue';
import RequestHistoryPanel from '../components/RequestHistoryPanel.vue';
import { api } from '../services/api';
import { currentUser } from '../services/auth';
import { requests as mockRequests } from '../services/mock';
import type { RepairRequest, SupplementDetail } from '../types';

const useMock=import.meta.env.VITE_USE_MOCK_API!=='false';
const toast=useToast();
const user=currentUser();
const items=ref<RepairRequest[]>([]);
const selected=ref<RepairRequest|null>(null);
const loading=ref(false);
const submitting=ref(false);
const supplement=ref<SupplementDetail[]>([]);
const form=ref({tail_number:'HL7701',aircraft_model:'A320-214',airline_code:user?.airline_code||'',symptom_text:''});
const aircraft=[
  {tail_number:'HL7701',aircraft_model:'A320-214'},
  {tail_number:'HL7724',aircraft_model:'A321-231'},
  {tail_number:'HL7718',aircraft_model:'A320-232'}
];
const processingStatuses=['QUEUED','CLASSIFYING','INVESTIGATING','REVIEWING'];
let listTimer:number|undefined;
let detailTimer:number|undefined;

async function loadRequests(){
  loading.value=true;
  try{
    items.value=useMock?[...mockRequests]:(await api.myRequests()).items;
    if(!selected.value)selected.value=items.value[0]??null;
  }catch{toast.add({severity:'error',summary:'요청 이력을 불러오지 못했습니다',detail:'잠시 후 다시 시도해 주세요.',life:3000});}
  finally{loading.value=false;}
}

async function submit(){
  if(!form.value.symptom_text.trim()){toast.add({severity:'warn',summary:'증상을 입력해 주세요',life:2200});return;}
  submitting.value=true;supplement.value=[];
  try{
    let created:RepairRequest;
    if(useMock){
      const now=new Date().toISOString();
      created={id:`REQ-2026-${String(items.value.length+13).padStart(4,'0')}`,...form.value,status:'QUEUED',created_at:now,updated_at:now};
    }else created=await api.createRequest({...form.value});
    items.value.unshift(created);selected.value=created;form.value.symptom_text='';
    toast.add({severity:'success',summary:'정비 요청이 접수되었습니다',detail:created.id,life:2600});
  }catch(error){
    if(axios.isAxiosError(error)&&error.response?.status===422&&error.response.data?.code==='NEEDS_SUPPLEMENT'){
      supplement.value=error.response.data.details??[];
      toast.add({severity:'warn',summary:'입력 내용을 보완해 주세요',life:3000});
    }else toast.add({severity:'error',summary:'요청을 접수하지 못했습니다',detail:'잠시 후 다시 시도해 주세요.',life:3000});
  }finally{submitting.value=false;}
}

async function refreshSelected(){
  if(useMock||!selected.value||!processingStatuses.includes(selected.value.status))return;
  try{
    const updated=await api.request(selected.value.id);selected.value=updated;
    const index=items.value.findIndex(item=>item.id===updated.id);if(index>=0)items.value.splice(index,1,updated);
  }catch{/* next poll */}
}

watch(selected,value=>{
  if(detailTimer)clearInterval(detailTimer);
  if(!useMock&&value&&processingStatuses.includes(value.status))detailTimer=window.setInterval(refreshSelected,3000);
});
onMounted(()=>{loadRequests();if(!useMock)listTimer=window.setInterval(loadRequests,15000);});
onUnmounted(()=>{if(listTimer)clearInterval(listTimer);if(detailTimer)clearInterval(detailTimer);});
</script>

<template>
  <AppShell>
    <template #role>정비 요청</template>
    <PageHeader title="정비 요청" description="기체 이상을 접수하고 처리 상태를 확인합니다."/>
    <div class="reporter-workflow">
      <RequestComposer v-model="form" :aircraft="aircraft" :submitting="submitting" :supplement="supplement" @submit="submit"/>
      <RequestHistoryPanel v-model:selected="selected" :items="items" :loading="loading"/>
    </div>
  </AppShell>
</template>
