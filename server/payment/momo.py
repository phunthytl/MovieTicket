import hashlib
import hmac
import uuid
import requests
from django.conf import settings

def create_momo_payment(order_id, amount):
    endpoint = settings.MOMO_ENDPOINT
    partner_code = settings.MOMO_PARTNER_CODE
    access_key = settings.MOMO_ACCESS_KEY
    secret_key = settings.MOMO_SECRET_KEY

    request_id = str(uuid.uuid4())
    order_info = f"Thanh toán đơn hàng #{order_id}"

    raw_data = (
        f"accessKey={access_key}&amount={amount}&extraData=&ipnUrl={settings.MOMO_IPN_URL}"
        f"&orderId={order_id}&orderInfo={order_info}&partnerCode={partner_code}"
        f"&redirectUrl={settings.MOMO_REDIRECT_URL}&requestId={request_id}&requestType=captureWallet"
    )

    signature = hmac.new(secret_key.encode(), raw_data.encode(), hashlib.sha256).hexdigest()

    body = {
        "partnerCode": partner_code,
        "accessKey": access_key,
        "requestId": request_id,
        "amount": str(amount),
        "orderId": str(order_id),
        "orderInfo": order_info,
        "redirectUrl": settings.MOMO_REDIRECT_URL,
        "ipnUrl": settings.MOMO_IPN_URL,
        "lang": "vi",
        "extraData": "",
        "requestType": "captureWallet",
        "signature": signature
    }

    headers = {'Content-Type': 'application/json'}
    response = requests.post(endpoint, json=body, headers=headers)
    return response.json()
