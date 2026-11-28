from datetime import date

def _coerce(v):
    if isinstance(v, str):
        try: return float(v) if '.' in v else int(v)
        except ValueError: return v.strip().lower()
    return v

def evaluate_rules(form_data, rules):
    checks=[]
    for r in rules:
        if not r.is_active: continue
        actual=form_data.get(r.field)
        expected=_coerce(r.value); actual_c=_coerce(actual)
        op=r.operator; passed=False
        try:
            if op=='==': passed=actual_c==expected
            elif op=='!=': passed=actual_c!=expected
            elif op=='>=': passed=actual_c>=expected
            elif op=='<=': passed=actual_c<=expected
            elif op=='contains': passed=str(expected) in str(actual_c)
            elif op=='in': passed=actual_c in expected if isinstance(expected,(list,tuple,set)) else str(actual_c) in str(expected).split(',')
        except (TypeError,ValueError): passed=False
        checks.append({'type':'eligibility_flag','severity':'high' if r.severity=='blocking' else 'medium','title':r.rule_name,'description':('Rule passed: '+r.rule_name) if passed else r.failure_message or f'Rule did not pass: {r.rule_name}','fieldAffected':r.field,'status':'PASS' if passed else 'WARNING','evidence':{'field':r.field,'actual':actual,'operator':op,'expected':r.value}})
    return checks
