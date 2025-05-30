import { NextApiRequest, NextApiResponse } from 'next';
import { DOMParser } from 'xmldom';

interface ZatcaValidationResult {
  success: boolean;
  validationPassed: boolean;
  message: string;
  details?: string;
  errors?: string[];
  warnings?: string[];
  mode: 'standalone';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZatcaValidationResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      validationPassed: false,
      message: 'Method not allowed',
      mode: 'standalone'
    });
  }

  const { xmlContent } = req.body;

  if (!xmlContent) {
    return res.status(400).json({
      success: false,
      validationPassed: false,
      message: 'XML content is required',
      mode: 'standalone'
    });
  }

  try {
    console.log('🔍 Starting standalone ZATCA validation...');
    
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parseErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      return res.status(400).json({
        success: false,
        validationPassed: false,
        message: 'XML parsing failed',
        details: 'Invalid XML format',
        errors: ['XML is not well-formed'],
        mode: 'standalone'
      });
    }

    // Perform ZATCA-specific validations
    const validationResult = await validateZatcaXml(xmlDoc, xmlContent);
    
    res.status(200).json(validationResult);
  } catch (error) {
    console.error('ZATCA standalone validation error:', error);
    res.status(500).json({
      success: false,
      validationPassed: false,
      message: 'Validation error: ' + (error as Error).message,
      details: (error as Error).stack,
      mode: 'standalone'
    });
  }
}

async function validateZatcaXml(xmlDoc: Document, xmlContent: string): Promise<ZatcaValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 1. Check root element
    const rootElement = xmlDoc.documentElement;
    if (!rootElement || rootElement.tagName !== 'Invoice') {
      errors.push('Root element must be "Invoice"');
    }

    // 2. Check required namespaces
    const requiredNamespaces = [
      'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
    ];
    
    for (const ns of requiredNamespaces) {
      if (xmlContent.indexOf(ns) === -1) {
        errors.push(`Missing required namespace: ${ns}`);
      }
    }

    // 3. Check UBL Extensions (ZATCA specific)
    const ublExtensions = xmlDoc.getElementsByTagName('UBLExtensions');
    if (ublExtensions.length === 0) {
      errors.push('Missing UBLExtensions element (required for ZATCA Phase 2)');
    } else {
      // Check for signature extension
      const extensions = xmlDoc.getElementsByTagName('UBLExtension');
      let hasSignatureExtension = false;
      for (let i = 0; i < extensions.length; i++) {
        const uri = extensions[i].getElementsByTagName('ExtensionURI')[0];
        if (uri && uri.textContent?.includes('dsig:enveloped:xades')) {
          hasSignatureExtension = true;
          break;
        }
      }
      if (!hasSignatureExtension) {
        warnings.push('Missing signature extension in UBLExtensions');
      }
    }

    // 4. Check Invoice ID
    const invoiceId = xmlDoc.getElementsByTagName('ID')[0];
    if (!invoiceId || !invoiceId.textContent) {
      errors.push('Missing Invoice ID');
    }

    // 5. Check Issue Date
    const issueDate = xmlDoc.getElementsByTagName('IssueDate')[0];
    if (!issueDate || !issueDate.textContent) {
      errors.push('Missing IssueDate');
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(issueDate.textContent)) {
        errors.push('IssueDate must be in YYYY-MM-DD format');
      }
    }

    // 6. Check Invoice Type Code
    const invoiceTypeCode = xmlDoc.getElementsByTagName('InvoiceTypeCode')[0];
    if (!invoiceTypeCode || !invoiceTypeCode.textContent) {
      errors.push('Missing InvoiceTypeCode');
    } else {
      const validTypeCodes = ['388', '381', '383', '386'];
      if (!validTypeCodes.includes(invoiceTypeCode.textContent)) {
        warnings.push(`InvoiceTypeCode "${invoiceTypeCode.textContent}" may not be valid for ZATCA`);
      }
    }

    // 7. Check Document Currency Code
    const currencyCode = xmlDoc.getElementsByTagName('DocumentCurrencyCode')[0];
    if (!currencyCode || !currencyCode.textContent) {
      errors.push('Missing DocumentCurrencyCode');
    } else if (currencyCode.textContent !== 'SAR') {
      warnings.push('DocumentCurrencyCode should be "SAR" for Saudi Arabia');
    }

    // 8. Check Additional Document References (ZATCA specific)
    const additionalDocRefs = xmlDoc.getElementsByTagName('AdditionalDocumentReference');
    let hasICV = false, hasPIH = false;
    
    for (let i = 0; i < additionalDocRefs.length; i++) {
      const id = additionalDocRefs[i].getElementsByTagName('ID')[0];
      if (id) {
        if (id.textContent === 'ICV') hasICV = true;
        if (id.textContent === 'PIH') hasPIH = true;
      }
    }
    
    if (!hasICV) {
      errors.push('Missing ICV (Invoice Counter Value) in AdditionalDocumentReference');
    }
    if (!hasPIH) {
      errors.push('Missing PIH (Previous Invoice Hash) in AdditionalDocumentReference');
    }

    // 9. Check Supplier Party
    const supplierParty = xmlDoc.getElementsByTagName('AccountingSupplierParty')[0];
    if (!supplierParty) {
      errors.push('Missing AccountingSupplierParty');
    } else {
      // Check VAT number
      const vatNumbers = supplierParty.getElementsByTagName('CompanyID');
      let hasVatNumber = false;
      for (let i = 0; i < vatNumbers.length; i++) {
        const schemeID = vatNumbers[i].getAttribute('schemeID');
        if (schemeID === 'VAT') {
          hasVatNumber = true;
          const vatNumber = vatNumbers[i].textContent;
          if (!vatNumber || vatNumber.length !== 15) {
            errors.push('VAT number must be 15 digits');
          }
          break;
        }
      }
      if (!hasVatNumber) {
        errors.push('Missing VAT number in AccountingSupplierParty');
      }
    }

    // 10. Check Customer Party
    const customerParty = xmlDoc.getElementsByTagName('AccountingCustomerParty')[0];
    if (!customerParty) {
      errors.push('Missing AccountingCustomerParty');
    }

    // 11. Check Tax Total
    const taxTotals = xmlDoc.getElementsByTagName('TaxTotal');
    if (taxTotals.length === 0) {
      errors.push('Missing TaxTotal element');
    } else {
      // Check tax subtotals
      const taxSubtotals = xmlDoc.getElementsByTagName('TaxSubtotal');
      if (taxSubtotals.length === 0) {
        errors.push('Missing TaxSubtotal elements');
      }
    }

    // 12. Check Legal Monetary Total
    const legalMonetaryTotal = xmlDoc.getElementsByTagName('LegalMonetaryTotal')[0];
    if (!legalMonetaryTotal) {
      errors.push('Missing LegalMonetaryTotal');
    } else {
      const requiredAmounts = ['LineExtensionAmount', 'TaxExclusiveAmount', 'TaxInclusiveAmount', 'PayableAmount'];
      for (const amount of requiredAmounts) {
        const element = legalMonetaryTotal.getElementsByTagName(amount)[0];
        if (!element) {
          errors.push(`Missing ${amount} in LegalMonetaryTotal`);
        }
      }
    }

    // 13. Check Invoice Lines
    const invoiceLines = xmlDoc.getElementsByTagName('InvoiceLine');
    if (invoiceLines.length === 0) {
      errors.push('Missing InvoiceLine elements');
    } else {
      // Validate each invoice line
      for (let i = 0; i < invoiceLines.length; i++) {
        const line = invoiceLines[i];
        const lineId = line.getElementsByTagName('ID')[0];
        if (!lineId) {
          errors.push(`Missing ID in InvoiceLine ${i + 1}`);
        }
        
        const quantity = line.getElementsByTagName('InvoicedQuantity')[0];
        if (!quantity) {
          errors.push(`Missing InvoicedQuantity in InvoiceLine ${i + 1}`);
        }
        
        const lineExtension = line.getElementsByTagName('LineExtensionAmount')[0];
        if (!lineExtension) {
          errors.push(`Missing LineExtensionAmount in InvoiceLine ${i + 1}`);
        }
      }
    }

    // 14. Check Signature (if present)
    const signatures = xmlDoc.getElementsByTagName('Signature');
    if (signatures.length > 0) {
      const signatureId = signatures[0].getElementsByTagName('ID')[0];
      if (!signatureId || signatureId.textContent !== 'urn:oasis:names:specification:ubl:signature:Invoice') {
        warnings.push('Signature ID should be "urn:oasis:names:specification:ubl:signature:Invoice"');
      }
    }

    // Determine validation result
    const validationPassed = errors.length === 0;
    
    let details = `ZATCA Standalone Validation Results:\n`;
    details += `- Total Errors: ${errors.length}\n`;
    details += `- Total Warnings: ${warnings.length}\n`;
    details += `- Validation Status: ${validationPassed ? 'PASSED' : 'FAILED'}\n\n`;
    
    if (errors.length > 0) {
      details += `Errors:\n${errors.map(e => `  ❌ ${e}`).join('\n')}\n\n`;
    }
    
    if (warnings.length > 0) {
      details += `Warnings:\n${warnings.map(w => `  ⚠️ ${w}`).join('\n')}\n`;
    }

    if (validationPassed) {
      details += `\n✅ XML structure is valid for ZATCA Phase 2 compliance`;
    }

    return {
      success: true,
      validationPassed,
      message: validationPassed ? 'ZATCA validation passed' : 'ZATCA validation failed',
      details,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      mode: 'standalone'
    };

  } catch (error) {
    return {
      success: false,
      validationPassed: false,
      message: 'Validation processing error: ' + (error as Error).message,
      details: (error as Error).stack,
      errors: ['Internal validation error'],
      mode: 'standalone'
    };
  }
} 