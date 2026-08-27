import json
import os

langs = {
    'en': {
        'title': 'Desplaza',
        'subtitle': 'Calculate and compare the real cost of your mobility.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Methodology',
        'footer_source': 'Source Code',
        'footer_license': 'All rights reserved'
    },
    'es': {
        'title': 'Desplaza',
        'subtitle': 'Calcula y compara el coste real de tu movilidad.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Metodología',
        'footer_source': 'Código Fuente',
        'footer_license': 'Derechos Reservados'
    },
    'fr': {
        'title': 'Desplaza',
        'subtitle': 'Calculez et comparez le coût réel de votre mobilité.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Méthodologie',
        'footer_source': 'Code Source',
        'footer_license': 'Tous droits réservés'
    },
    'de': {
        'title': 'Desplaza',
        'subtitle': 'Berechnen und vergleichen Sie die wahren Kosten Ihrer Mobilität.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Methodik',
        'footer_source': 'Quellcode',
        'footer_license': 'Alle Rechte vorbehalten'
    },
    'it': {
        'title': 'Desplaza',
        'subtitle': 'Calcola e confronta il costo reale della tua mobilità.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Metodologia',
        'footer_source': 'Codice Sorgente',
        'footer_license': 'Tutti i diritti riservati'
    },
    'pt': {
        'title': 'Desplaza',
        'subtitle': 'Calcule e compare o custo real da sua mobilidade.',
        'footer_text': 'Desplaza MVP',
        'footer_methodology': 'Metodologia',
        'footer_source': 'Código Fonte',
        'footer_license': 'Todos os direitos reservados'
    }
}

dir_path = 'src/i18n'
for lang, data in langs.items():
    file_path = os.path.join(dir_path, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = json.load(f)
        
        # update header
        if 'header' not in content:
            content['header'] = {}
        content['header']['title'] = data['title']
        content['header']['subtitle'] = data['subtitle']
        
        # update footer
        if 'footer' not in content:
            content['footer'] = {}
        content['footer']['text'] = data['footer_text']
        content['footer']['methodology'] = data['footer_methodology']
        content['footer']['source'] = data['footer_source']
        content['footer']['license'] = data['footer_license']
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False)
            
