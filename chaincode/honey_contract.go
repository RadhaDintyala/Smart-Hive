package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// HoneyBatchContract represents the Hyperledger Fabric Smart Contract for Honey Traceability
type HoneyBatchContract struct {
	contractapi.Contract
}

// BeekeeperInfo represents apiary and producer credentials
type BeekeeperInfo struct {
	Name    string `json:"name"`
	Apiary  string `json:"apiary"`
	License string `json:"license"`
}

// LabTestResult represents NABL/ISO lab verification recorded on ledger
type LabTestResult struct {
	LabName            string  `json:"labName"`
	TestedAt           string  `json:"testedAt"`
	PurityPercentage   float64 `json:"purityPercentage"`
	MoisturePercentage float64 `json:"moisturePercentage"`
	HmfMgKg            float64 `json:"hmfMgKg"`
	PollenCount        string  `json:"pollenCount"`
	AntibioticResidues string  `json:"antibioticResidues"`
	Status             string  `json:"status"`
}

// RetailLog represents supply chain transfer to retail
type RetailLog struct {
	StoreName     string `json:"storeName"`
	VerifiedAt    string `json:"verifiedAt"`
	StockQuantity int    `json:"stockQuantity"`
}

// HoneyBatchLedgerRecord defines the state stored on Hyperledger Fabric World State DB
type HoneyBatchLedgerRecord struct {
	BatchID          string         `json:"batchId"`
	CreatedAt        string         `json:"createdAt"`
	Status           string         `json:"status"`
	Beekeeper        BeekeeperInfo  `json:"beekeeper"`
	PayloadIpfsCID   string         `json:"payloadIpfsCID"`   // IPFS Off-chain Content Identifier for raw telemetry & audio
	DataHashSHA256   string         `json:"dataHashSHA256"`   // SHA-256 Digest of full off-chain payload
	LabResults       *LabTestResult `json:"labResults,omitempty"`
	RetailHistory    []RetailLog    `json:"retailHistory,omitempty"`
	TxID             string         `json:"txId"`
	PeerEndorsements []string       `json:"peerEndorsements"`
}

// HistoryQueryResult structure for audit trail querying
type HistoryQueryResult struct {
	TxId      string                 `json:"txId"`
	Timestamp string                 `json:"timestamp"`
	IsDelete  bool                   `json:"isDelete"`
	Record    HoneyBatchLedgerRecord `json:"record"`
}

// InitLedger initializes the chaincode state
func (c *HoneyBatchContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("HoneyTraceability Smart Contract Initialized on Hyperledger Fabric 2.5+")
	return nil
}

// CreateBatch registers a new honey batch on the Fabric ledger with its off-chain IPFS CID
func (c *HoneyBatchContract) CreateBatch(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	createdAt string,
	beekeeperName string,
	apiary string,
	license string,
	ipfsCID string,
	sha256Hash string,
) error {

	exists, err := c.BatchExists(ctx, batchID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("batch %s already exists on the ledger", batchID)
	}

	txID := ctx.GetStub().GetTxID()

	record := HoneyBatchLedgerRecord{
		BatchID:        batchID,
		CreatedAt:      createdAt,
		Status:         "PENDING_LAB",
		Beekeeper: BeekeeperInfo{
			Name:    beekeeperName,
			Apiary:  apiary,
			License: license,
		},
		PayloadIpfsCID: ipfsCID,
		DataHashSHA256: sha256Hash,
		RetailHistory:  make([]RetailLog, 0),
		TxID:           txID,
		PeerEndorsements: []string{
			"Peer0.Org1.Beekeepers.smart-hive.gov",
			"Peer0.Org2.Laboratories.smart-hive.gov",
		},
	}

	bytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	// Put on Fabric World State (CouchDB / LevelDB)
	return ctx.GetStub().PutState(batchID, bytes)
}

// RecordLabResult adds lab test verification to the batch ledger record
func (c *HoneyBatchContract) RecordLabResult(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	labName string,
	testedAt string,
	purity float64,
	moisture float64,
	hmf float64,
	pollen string,
	antibiotics string,
	passStatus string,
) error {

	record, err := c.ReadBatch(ctx, batchID)
	if err != nil {
		return err
	}

	record.LabResults = &LabTestResult{
		LabName:            labName,
		TestedAt:           testedAt,
		PurityPercentage:   purity,
		MoisturePercentage: moisture,
		HmfMgKg:            hmf,
		PollenCount:        pollen,
		AntibioticResidues: antibiotics,
		Status:             passStatus,
	}

	if passStatus == "PASS" {
		record.Status = "VERIFIED_ORGANIC_GRADE_A"
	} else {
		record.Status = "FAILED_QUALITY_TEST"
	}

	bytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(batchID, bytes)
}

// RecordRetailReceipt adds retailer verification and stock logging
func (c *HoneyBatchContract) RecordRetailReceipt(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	storeName string,
	verifiedAt string,
	quantity int,
) error {
	record, err := c.ReadBatch(ctx, batchID)
	if err != nil {
		return err
	}

	retailLog := RetailLog{
		StoreName:     storeName,
		VerifiedAt:    verifiedAt,
		StockQuantity: quantity,
	}

	record.RetailHistory = append(record.RetailHistory, retailLog)

	bytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(batchID, bytes)
}

// ReadBatch retrieves the state of a batch from the Fabric ledger
func (c *HoneyBatchContract) ReadBatch(ctx contractapi.TransactionContextInterface, batchID string) (*HoneyBatchLedgerRecord, error) {
	bytes, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from state database: %v", err)
	}
	if bytes == nil {
		return nil, fmt.Errorf("batch %s does not exist on Hyperledger Fabric ledger", batchID)
	}

	var record HoneyBatchLedgerRecord
	err = json.Unmarshal(bytes, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

// VerifyBatchIntegrity re-hashes off-chain IPFS payload content and verifies matching on-chain SHA-256
func (c *HoneyBatchContract) VerifyBatchIntegrity(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	fetchedOffChainPayload string,
) (bool, string, error) {

	record, err := c.ReadBatch(ctx, batchID)
	if err != nil {
		return false, "", err
	}

	// Compute SHA-256 of off-chain payload
	hasher := sha256.New()
	hasher.Write([]byte(fetchedOffChainPayload))
	computedHash := hex.EncodeToString(hasher.Sum(nil))

	isMatch := (computedHash == record.DataHashSHA256)
	if !isMatch {
		return false, computedHash, fmt.Errorf("INTEGRITY VIOLATION DETECTED: Computed off-chain hash [%s] does not match immutable Hyperledger ledger hash [%s]", computedHash, record.DataHashSHA256)
	}

	return true, computedHash, nil
}

// GetBatchHistory returns the complete audit trail (all transaction states) for a batch
func (c *HoneyBatchContract) GetBatchHistory(ctx contractapi.TransactionContextInterface, batchID string) ([]HistoryQueryResult, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(batchID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryQueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var record HoneyBatchLedgerRecord
		if len(response.Value) > 0 {
			_ = json.Unmarshal(response.Value, &record)
		}

		historyItem := HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: response.Timestamp.String(),
			IsDelete:  response.IsDelete,
			Record:    record,
		}
		records = append(records, historyItem)
	}

	return records, nil
}

// BatchExists checks if a batchID exists on the ledger
func (c *HoneyBatchContract) BatchExists(ctx contractapi.TransactionContextInterface, batchID string) (bool, error) {
	bytes, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return false, err
	}
	return bytes != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&HoneyBatchContract{})
	if err != nil {
		fmt.Printf("Error creating HoneyBatchContract chaincode: %s\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting HoneyBatchContract chaincode: %s\n", err)
	}
}
