// n8n Code node — decide Update/Create after the Monday Session ID search.
// Input: { normalized, foundItems }. The search node must return current Status
// and Leadfase text values so this node can prevent backwards transitions.

const input = $input.first().json;
const normalized = input.normalized || input;
const foundItems = Array.isArray(input.foundItems) ? input.foundItems : [];
const c = normalized.config.columns;
const rank = {'Naam ontvangen':0,'E-mail ontvangen':1,'Telefoon ontvangen':2,'Berekening voltooid':3};
const protectedStatus = new Set(['Contact opnemen','Afspraak','Offerte','Gewonnen','Verloren']);

if (!normalized.lookup?.value) throw new Error('Session ID lookup is required');
if (foundItems.length > 1) throw new Error('Duplicate Monday items found for one session_id; manual consolidation required');

if (foundItems.length === 1) {
  const item = foundItems[0];
  const currentStage = item.lead_stage || item.leadStage || '';
  const currentStatus = item.status || '';
  const columns = {...normalized.update_columns};
  if ((rank[normalized.stage.label] ?? -1) > (rank[currentStage] ?? -1)) {
    columns[c.leadStage] = {label:normalized.stage.label};
  }
  if (normalized.completion.promote_to_warm && !protectedStatus.has(currentStatus)) {
    Object.assign(columns, normalized.promotion_columns);
  }
  return [{json:{action:'update',item_id:Number(item.id),board_id:normalized.config.boardId,column_values:columns,session_id:normalized.lookup.value}}];
}

return [{json:{
  action:'create', board_id:normalized.config.boardId, group_id:normalized.config.groupId,
  item_name:normalized.item_name, column_values:normalized.create_columns,
  session_id:normalized.lookup.value,
  // Configure a Data Table with unique key session_id before Create Item.
  // If insert conflicts, do not create: wait 750 ms, search Monday again, update.
  lock:{key:normalized.lookup.value,on_conflict:'retry_search',retry_delay_ms:750,max_retries:3},
}}];
