from app.workers.celery_app import celery_app
@celery_app.task(bind=True,max_retries=2)
def verification_placeholder(self,application_id):
    """Queue plumbing placeholder; synchronous verification endpoint currently runs pipeline."""
    return {'applicationId':application_id,'status':'queued','message':'Worker task infrastructure is available; endpoint integration is pending.'}
