import axios from "axios";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { env } from "../../../config/env";
import { AppError } from "../../../utils/AppError";

/**
 * DPO (Direct Pay Online) — unlike Selcom/Flutterwave, DPO's API is
 * XML-over-HTTP rather than JSON, which is why this adapter looks
 * different in shape from the other two. Flow: createToken → redirect
 * customer to DPO's hosted payment page with that token → verifyToken
 * once they return.
 *
 * Field names follow DPO's published API v6 XML schema; not exercised
 * against a live/sandbox account in this environment — confirm exact
 * field names against your DPO integration guide before going live.
 */

const xmlBuilder = new XMLBuilder({ format: false });
const xmlParser = new XMLParser();

interface DpoPaymentParams {
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
}

function requireConfig() {
  if (!env.DPO_COMPANY_TOKEN || !env.DPO_SERVICE_TYPE || !env.DPO_BASE_URL) {
    throw new AppError("DPO is not configured — set DPO_* environment variables", 500);
  }
  return { companyToken: env.DPO_COMPANY_TOKEN, serviceType: env.DPO_SERVICE_TYPE, baseUrl: env.DPO_BASE_URL };
}

export const dpoProvider = {
  async createCheckout(params: DpoPaymentParams): Promise<{ providerRef: string; redirectUrl: string }> {
    const { companyToken, serviceType, baseUrl } = requireConfig();

    const requestXml = xmlBuilder.build({
      API3G: {
        CompanyToken: companyToken,
        Request: "createToken",
        Transaction: {
          PaymentAmount: (params.amountCents / 100).toFixed(2),
          PaymentCurrency: params.currency,
          CompanyRef: params.orderId,
          RedirectURL: `${env.APP_URL}/order-success?orderId=${params.orderId}`,
          BackURL: `${env.APP_URL}/checkout`,
          CustomerEmail: params.customerEmail,
          CustomerFirstName: params.customerFirstName,
          CustomerLastName: params.customerLastName,
        },
        Services: {
          Service: { ServiceType: serviceType, ServiceDescription: "PJHerbal Clinic order", ServiceDate: new Date().toISOString().slice(0, 10) },
        },
      },
    });

    try {
      const res = await axios.post(baseUrl, requestXml, { headers: { "Content-Type": "text/xml" } });
      const parsed = xmlParser.parse(res.data)?.API3G;

      if (parsed?.Result !== "000") {
        throw new AppError(`DPO rejected the order: ${parsed?.ResultExplanation ?? "unknown error"}`, 502);
      }

      return {
        providerRef: parsed.TransToken,
        redirectUrl: `${baseUrl.replace("/API/v6/", "")}/payv2.php?ID=${parsed.TransToken}`,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Could not reach DPO", 502, err);
    }
  },

  /**
   * DPO has no signed-webhook mechanism in the same sense as Selcom/
   * Flutterwave — verification is done by actively polling verifyToken
   * with the token DPO gave us at createCheckout time, using our own
   * stored providerRef as the source of truth rather than trusting an
   * inbound callback's claimed status.
   */
  async verifyToken(transToken: string) {
    const { companyToken, baseUrl } = requireConfig();
    const requestXml = xmlBuilder.build({
      API3G: { CompanyToken: companyToken, Request: "verifyToken", TransactionToken: transToken },
    });
    const res = await axios.post(baseUrl, requestXml, { headers: { "Content-Type": "text/xml" } });
    const parsed = xmlParser.parse(res.data)?.API3G;
    return {
      approved: parsed?.Result === "000" && parsed?.TransactionApproval === "1",
      raw: parsed,
    };
  },
};
