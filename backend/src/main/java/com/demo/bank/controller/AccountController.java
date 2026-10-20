package com.demo.bank.controller;

import com.demo.bank.dto.AccountResponse;
import com.demo.bank.dto.CreateAccountRequest;
import com.demo.bank.entity.Account;
import com.demo.bank.repository.AccountRepository;
import com.demo.bank.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final com.demo.bank.repository.TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(@RequestParam Long userId) {
        List<AccountResponse> accounts = accountRepository.findByUserId(userId)
                .stream().map(AccountResponse::from).toList();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/lookup")
    public ResponseEntity<AccountResponse> lookupAccount(@RequestParam String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(AccountResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest req) {
        var user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal minBalance = req.getAccountType() == Account.AccountType.SAVINGS
                ? BigDecimal.valueOf(500) : BigDecimal.valueOf(1000);

        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(req.getAccountType())
                .balance(req.getInitialDeposit())
                .minimumBalance(minBalance)
                .availableCredit(BigDecimal.valueOf(10000))
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        accountRepository.save(account);

        if (req.getInitialDeposit() != null && req.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            com.demo.bank.entity.Transaction initialTx = com.demo.bank.entity.Transaction.builder()
                    .type(com.demo.bank.entity.Transaction.TransactionType.DEPOSIT)
                    .amount(req.getInitialDeposit())
                    .balanceAfter(req.getInitialDeposit())
                    .description("Initial Deposit - Account Opening")
                    .category("Deposit")
                    .status(com.demo.bank.entity.Transaction.TransactionStatus.COMPLETED)
                    .createdAt(LocalDateTime.now())
                    .account(account)
                    .build();
            transactionRepository.save(initialTx);
        }

        return ResponseEntity.ok(AccountResponse.from(account));
    }

    private String generateAccountNumber() {
        String prefix = "1000";
        String digits = String.format("%08d", new Random().nextInt(100000000));
        String candidate = prefix + digits;
        while (accountRepository.existsByAccountNumber(candidate)) {
            digits = String.format("%08d", new Random().nextInt(100000000));
            candidate = prefix + digits;
        }
        return candidate;
    }
}
