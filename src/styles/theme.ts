import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const MroPreset=definePreset(Aura,{
  semantic:{
    primary:{50:'#f2f5fa',100:'#e3e9f3',200:'#c4d0e3',300:'#98acd0',400:'#587bb1',500:'#24508e',600:'#00256c',700:'#001f5c',800:'#001a4d',900:'#001640',950:'#000e2a'},
    colorScheme:{light:{surface:{0:'#ffffff',50:'#f8fafb',100:'#f1f4f6',200:'#e3e7eb',300:'#d0d5db',400:'#98a2b3',500:'#667085',600:'#475467',700:'#344054',800:'#1d2939',900:'#17202e',950:'#101828'}}}
  },
  components:{button:{borderRadius:'4px'},inputtext:{borderRadius:'4px'},select:{borderRadius:'4px'},textarea:{borderRadius:'4px'},datatable:{headerCell:{background:'#f7f8fa',color:'#475467'}}}
});
