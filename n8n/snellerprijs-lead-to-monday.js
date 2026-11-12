// n8n Code node — normalize Snelle Prijs events for the real Monday board.
// IDs read from Monday on 2026-11-12. Do not rename or guess IDs.
const MONDAY = Object.freeze({
  boardId: 5107699907, boardName: 'CRM & Leads - Ramen en Deuren',
  groupId: 'topics', groupName: 'Leads', managerUserId: 100544762,
  columns: Object.freeze({
    name:'name', language:'dropdown_mm91e9pb', postcode:'text_mm91e2t5', municipality:'text_mm91m70b',
    email:'email_mm91apdw', phone:'phone_mm91nszr', buildingType:'dropdown_mm91g9zv', status:'color_mm917s33',
    requestId:'text_mm9118s3', sessionId:'text_mm91qrse', source:'dropdown_mm91dqdr', pdfFile:'file_mm91h41c',
    createdAt:'date_mm918czt', notes:'long_text_mm91rbsq', leadStage:'color_mm91z86n', partnerSharing:'boolean_mm9183pp',
    marketingConsent:'boolean_mm91vqgm', lastActivity:'date_mm91aefd', colour:'dropdown_mm91kvbr', campaign:'text_mm91513a',
    pdfSent:'color_mm91396x', products:'long_text_mm91ndr4', priceStatus:'color_mm9130ft', shutters:'long_text_mm91bf8y',
    vat:'color_mm91mafc', followUpDate:'date_mm91z83g', selection:'long_text_mm91ep9d', priceLow:'numeric_mm914qz4',
    profile:'color_mm9180d2', utmCampaign:'text_mm91besr', ventilation:'long_text_mm9149sb', glazing:'dropdown_mm91byaw',
    screens:'numeric_mm91hajx', extras:'long_text_mm91y123', utmMedium:'text_mm91pf0c', priceHigh:'numeric_mm91tw5',
    privacyVersion:'text_mm91wwaj', calculationId:'text_mm91hjqx', utmSource:'text_mm91d1s5', manager:'multiple_person_mm91sf3p',
  }),
});

const input = $input.first().json;
const request = input.request || input.body || input;
const delivery = input._deliveryResult || {};
const calculation = input.trustedCalculation || input.calculation || null;
const contact = request.contact || {}, consent = request.consent || {}, project = request.project || {}, options = request.options || {};
const c = MONDAY.columns;
if (!request.session_id) throw new Error('session_id is required');
if (!contact.name || !contact.email) throw new Error('Name and email are required');
if (request.stage !== 'email_captured' && !contact.phone) throw new Error('Phone is required after email_captured');

const dict = {
  products:{fixed:'Vast raam',tilt_turn:'Draai-kiepraam',two_sash:'Dubbel draai-kiepraam',three_sash:'Driedelig draai-kiepraam',panoramic_fixed:'Panoramisch vast raam',sliding:'Schuifraam',door:'Buitendeur',garage:'Sectionale garagepoort'},
  profile:{budget:'Budget',optimal:'Optimaal'}, glazing:{double:'Dubbel',triple:'Driedubbel'},
  colour:{white:'Wit',outside:'Kleur buiten',both:'Kleur binnen en buiten'},
  shutter:{none:'Geen rolluik',surface:'Voorzetrolluik',built_in:'Opbouwrolluik'},
  ventilation:{none:'Geen ventilatierooster',glass:'Rooster in het glas',profile:'Rooster op het profiel'},
  building:{house:'Woning',apartment:'Appartement',new_build:'Nieuwbouw',other:'Andere'},
  vat:{renovation_6:'6%',standard_21:'21%'},
};
const label = (group,key,fallback='') => dict[group][key] || fallback;
const text = value => String(value ?? '').trim();
const dateOnly = value => { const d=new Date(value||Date.now()); return (Number.isNaN(d.getTime())?new Date():d).toISOString().slice(0,10); };
const phoneValue = value => { const v=text(value).replace(/[^\d+]/g,''); return v?{phone:v,countryShortName:'BE'}:null; };
const emailValue = value => { const v=text(value).toLowerCase(); return v?{email:v,text:v}:null; };
const longText = value => ({text:text(value)}), status = value => ({label:value}), dropdown = value => ({labels:[value]});
const checkbox = value => ({checked:value?'true':'false'}), number = value => Number.isFinite(Number(value))?String(Number(value)):null;
const person = id => ({personsAndTeams:[{id:Number(id),kind:'person'}]});

const products=(request.products||[]).filter(p=>Number(p.quantity)>0);
const productLines=products.map(p=>`${label('products',p.type,'Onbekend element')} × ${Number(p.quantity)}`);
const screenQty=Number(options.mosquito_screen_quantity||0), shutterQty=Number(options.shutter_quantity||0), ventQty=Number(options.ventilation_quantity||0);
const profileLabel=label('profile',options.profile,'Budget'), glazingLabel=label('glazing',options.glazing,'Dubbel');
const selectionLines=[
  ...productLines, `${profileLabel} · ${glazingLabel.toLowerCase()} glas`, label('colour',options.colour),
  options.shutter&&options.shutter!=='none'&&shutterQty>0?`${label('shutter',options.shutter)} × ${shutterQty}`:'',
  options.ventilation_type&&options.ventilation_type!=='none'&&ventQty>0?`${label('ventilation',options.ventilation_type)} × ${ventQty}`:'',
  options.mosquito_screen&&screenQty>0?`Vliegenramen × ${screenQty}`:'',
  project.vat_choice==='renovation_6'?'6% btw onder voorbehoud':'21% btw',
].filter(Boolean);

const eventAt=request.submitted_at||request.updated_at||new Date().toISOString();
const pricingSucceeded=Boolean(calculation?.calculation_id&&Number.isFinite(Number(calculation?.price_low_incl_vat))&&Number.isFinite(Number(calculation?.price_high_incl_vat)));
const pdfSent=delivery.email_sent===true, completed=pricingSucceeded&&pdfSent;
const stageLabel=completed?'Berekening voltooid':request.stage==='phone_captured'||request.stage==='calculation_completed'?'Telefoon ontvangen':request.stage==='email_captured'?'E-mail ontvangen':'Naam ontvangen';
const stageRank={'Naam ontvangen':0,'E-mail ontvangen':1,'Telefoon ontvangen':2,'Berekening voltooid':3}[stageLabel];
const notes=['RamenSpecialist.com / Snelle Prijs',`Fase: ${stageLabel}`,`Taal: ${text(request.language||'nl').toUpperCase()}`,`Gemeente: ${text(project.postcode)} ${text(project.municipality)}`.trim(),contact.notes?`Klantnotitie: ${text(contact.notes)}`:'',request.manual_review?'Handmatige technische controle nodig':''].filter(Boolean).join('\n');

const common={
  [c.language]:dropdown(text(request.language||'nl').toUpperCase()), [c.postcode]:text(project.postcode), [c.municipality]:text(project.municipality),
  [c.email]:emailValue(contact.email), ...(phoneValue(contact.phone)?{[c.phone]:phoneValue(contact.phone)}:{}),
  [c.requestId]:text(request.request_id), [c.sessionId]:text(request.session_id), [c.source]:dropdown('Snelle Prijs'), [c.notes]:longText(notes),
  [c.partnerSharing]:checkbox(Boolean(consent.partner_sharing)), [c.marketingConsent]:checkbox(Boolean(consent.marketing_personalisation)),
  [c.lastActivity]:{date:dateOnly(eventAt)}, [c.colour]:dropdown(label('colour',options.colour,'Wit')), [c.campaign]:text(request.utm?.campaign),
  [c.products]:longText(productLines.join('\n')), [c.priceStatus]:status(pricingSucceeded?'Berekend':'Niet beschikbaar'),
  [c.shutters]:longText(options.shutter&&options.shutter!=='none'&&shutterQty>0?`${label('shutter',options.shutter)} × ${shutterQty}`:'Geen rolluik'),
  [c.vat]:status(label('vat',project.vat_choice,'Te controleren')), [c.selection]:longText(selectionLines.join('\n')), [c.profile]:status(profileLabel),
  [c.utmCampaign]:text(request.utm?.campaign),
  [c.ventilation]:longText(options.ventilation_type&&options.ventilation_type!=='none'&&ventQty>0?`${label('ventilation',options.ventilation_type)} × ${ventQty}`:'Geen ventilatierooster'),
  [c.glazing]:dropdown(glazingLabel), [c.screens]:number(screenQty), [c.extras]:longText(request.manual_review?'Technische controle nodig':''),
  [c.utmMedium]:text(request.utm?.medium), [c.privacyVersion]:text(consent.privacy_notice_version), [c.utmSource]:text(request.utm?.source),
  [c.buildingType]:dropdown(label('building',project.building_type,'Andere')), [c.pdfSent]:status(pdfSent?'Ja':delivery.email_error?'Fout':'Nee'),
  ...(pricingSucceeded?{[c.priceLow]:number(calculation.price_low_incl_vat),[c.priceHigh]:number(calculation.price_high_incl_vat),[c.calculationId]:text(calculation.calculation_id)}:{}),
};

// Manager and creation date are supplied only on create. Update nodes must preserve them.
const createOnly={[c.createdAt]:{date:dateOnly(eventAt)},[c.manager]:person(MONDAY.managerUserId)};
return [{json:{
  operation:'upsert_by_session_id', config:MONDAY, item_name:text(contact.name),
  lookup:{column_id:c.sessionId,value:text(request.session_id),request_id:text(request.request_id)||null},
  stage:{label:stageLabel,rank:stageRank}, completion:{pricing_succeeded:pricingSucceeded,pdf_sent:pdfSent,promote_to_warm:completed},
  create_columns:{...common,...createOnly,[c.status]:status(completed?'Berekening verzonden':'New'),[c.leadStage]:status(stageLabel)},
  update_columns:common,
  promotion_columns:completed?{[c.status]:status('Berekening verzonden'),[c.leadStage]:status('Berekening voltooid')}:{},
  readable_selection:selectionLines,
  metadata:{session_id:text(request.session_id),request_id:text(request.request_id),event_at:eventAt,stage_rank:stageRank,calculation_id:pricingSucceeded?text(calculation.calculation_id):''},
}}];
