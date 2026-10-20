package com.demo.bank.service;

import com.demo.bank.dto.*;
import com.demo.bank.entity.*;
import com.demo.bank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse deposit(TransactionRequest req) {
        Account account = getActiveAccount(req.getAccountId());

        account.setBalance(account.getBalance().add(req.getAmount()));
        accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .type(Transaction.TransactionType.DEPOSIT)
                .amount(req.getAmount())
                .balanceAfter(account.getBalance())
                .description(req.getDescription() != null ? req.getDescription() : "Deposit")
                .category(req.getCategory() != null ? req.getCategory() : "Income")
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);

        return TransactionResponse.from(tx);
    }

    @Transactional
    public TransactionResponse withdraw(TransactionRequest req) {
        Account account = getActiveAccount(req.getAccountId());

        BigDecimal newBalance = account.getBalance().subtract(req.getAmount());
        if (newBalance.compareTo(account.getMinimumBalance()) < 0) {
            throw new RuntimeException("Insufficient funds. Minimum balance of ₹"
                    + account.getMinimumBalance() + " must be maintained.");
        }

        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction tx = Transaction.builder()
                .type(Transaction.TransactionType.WITHDRAWAL)
                .amount(req.getAmount())
                .balanceAfter(account.getBalance())
                .description(req.getDescription() != null ? req.getDescription() : "Withdrawal")
                .category(req.getCategory() != null ? req.getCategory() : "Expense")
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .account(account)
                .build();
        transactionRepository.save(tx);

        return TransactionResponse.from(tx);
    }

    @Transactional
    public TransactionResponse transfer(TransactionRequest req) {
        if (req.getToAccountNumber() == null || req.getToAccountNumber().isBlank()) {
            throw new RuntimeException("Destination account number is required");
        }

        Account from = getActiveAccount(req.getAccountId());

        Account to = accountRepository.findByAccountNumber(req.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (to.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Destination account is not active");
        }

        if (from.getId().equals(to.getId())) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        BigDecimal newFromBalance = from.getBalance().subtract(req.getAmount());
        if (newFromBalance.compareTo(from.getMinimumBalance()) < 0) {
            throw new RuntimeException("Insufficient funds. Cannot transfer below minimum balance of ₹" + from.getMinimumBalance());
        }

        from.setBalance(newFromBalance);
        to.setBalance(to.getBalance().add(req.getAmount()));
        accountRepository.save(from);
        accountRepository.save(to);

        String desc = req.getDescription() != null ? req.getDescription() : "Transfer";

        // Debit entry for sender
        Transaction outTx = Transaction.builder()
                .type(Transaction.TransactionType.TRANSFER_OUT)
                .amount(req.getAmount())
                .balanceAfter(from.getBalance())
                .description(desc + " to " + to.getAccountNumber())
                .counterpartyAccount(to.getAccountNumber())
                .category("Transfer")
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .account(from)
                .build();
        transactionRepository.save(outTx);

        // Credit entry for receiver
        Transaction inTx = Transaction.builder()
                .type(Transaction.TransactionType.TRANSFER_IN)
                .amount(req.getAmount())
                .balanceAfter(to.getBalance())
                .description(desc + " from " + from.getAccountNumber())
                .counterpartyAccount(from.getAccountNumber())
                .category("Transfer")
                .status(Transaction.TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .account(to)
                .build();
        transactionRepository.save(inTx);

        return TransactionResponse.from(outTx);
    }

    public List<TransactionResponse> getTransactions(Long accountId) {
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
                .stream().map(TransactionResponse::from).toList();
    }

    public Page<TransactionResponse> getTransactionsPaged(
            Long accountId, Transaction.TransactionType type,
            LocalDateTime from, LocalDateTime to, int page, int size) {
        return transactionRepository.findFiltered(accountId, type, from, to,
                PageRequest.of(page, size)).map(TransactionResponse::from);
    }

    private Account getActiveAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }
        return account;
    }
}
