package com.demo.bank.seed;

import com.demo.bank.entity.*;
import com.demo.bank.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    private final Random rng = new Random(42);

    @Override
    public void run(String... args) {
        log.info("Seeding demo data...");

        // --- Admin ---
        User admin = saveUser("Admin User", "admin@bank.com", "+19001234567", "admin123", User.Role.ADMIN);

        // --- Customer 1: Alice ---
        User alice = saveUser("Alice Johnson", "demo@bank.com", "+12125550100", "demo123", User.Role.CUSTOMER);
        Account aliceSavings = saveAccount("100000000001", Account.AccountType.SAVINGS,
                new BigDecimal("24580.00"), new BigDecimal("500"), new BigDecimal("15000"), alice);
        Account aliceCurrent = saveAccount("100000000002", Account.AccountType.CURRENT,
                new BigDecimal("8350.75"), new BigDecimal("1000"), new BigDecimal("25000"), alice);
        Account aliceCredit = saveAccount("100000000003", Account.AccountType.SAVINGS,
                new BigDecimal("5200.00"), new BigDecimal("500"), new BigDecimal("10000"), alice);

        // --- Customer 2: Bob ---
        User bob = saveUser("Bob Martinez", "bob@bank.com", "+12125550200", "bob123", User.Role.CUSTOMER);
        Account bobSavings = saveAccount("100000000004", Account.AccountType.SAVINGS,
                new BigDecimal("12430.50"), new BigDecimal("500"), new BigDecimal("10000"), bob);
        Account bobCurrent = saveAccount("100000000005", Account.AccountType.CURRENT,
                new BigDecimal("3780.25"), new BigDecimal("1000"), new BigDecimal("20000"), bob);
        Account bobExtra = saveAccount("100000000006", Account.AccountType.CURRENT,
                new BigDecimal("950.00"), new BigDecimal("1000"), new BigDecimal("5000"), bob);

        // Seed 30 transactions spread across accounts
        seedTransactions(aliceSavings, aliceCurrent);
        seedTransactions(bobSavings, bobCurrent);

        log.info("Demo data seeded successfully.");
        log.info("  Admin:    admin@bank.com / admin123");
        log.info("  Customer: demo@bank.com  / demo123");
        log.info("  Customer: bob@bank.com   / bob123");
    }

    private User saveUser(String name, String email, String phone, String password, User.Role role) {
        User u = User.builder()
                .name(name).email(email).phone(phone).password(password)
                .role(role).active(true).createdAt(LocalDateTime.now().minusDays(rng.nextInt(200)))
                .build();
        return userRepository.save(u);
    }

    private Account saveAccount(String number, Account.AccountType type, BigDecimal balance,
                                BigDecimal minBalance, BigDecimal credit, User user) {
        Account a = Account.builder()
                .accountNumber(number).accountType(type).balance(balance)
                .minimumBalance(minBalance).availableCredit(credit)
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(rng.nextInt(180)))
                .user(user).build();
        return accountRepository.save(a);
    }

    private void seedTransactions(Account primary, Account secondary) {
        String[] categories = {"Food", "Shopping", "Transport", "Utilities", "Entertainment", "Health", "Income", "Transfer"};
        String[] descs = {"Grocery Store", "Amazon Purchase", "Uber Ride", "Electric Bill",
                "Netflix", "Pharmacy", "Salary Credit", "Online Transfer",
                "Restaurant", "Fuel", "Insurance Premium", "ATM Withdrawal",
                "Rent Payment", "Freelance Income", "Mobile Recharge"};

        for (int i = 0; i < 15; i++) {
            Transaction.TransactionType type;
            int r = rng.nextInt(4);
            if (r == 0) type = Transaction.TransactionType.DEPOSIT;
            else if (r == 1) type = Transaction.TransactionType.WITHDRAWAL;
            else if (r == 2) type = Transaction.TransactionType.TRANSFER_OUT;
            else type = Transaction.TransactionType.TRANSFER_IN;

            BigDecimal amount = BigDecimal.valueOf(50 + rng.nextInt(2950)).setScale(2);
            BigDecimal balanceAfter = primary.getBalance().add(
                    (type == Transaction.TransactionType.DEPOSIT || type == Transaction.TransactionType.TRANSFER_IN)
                            ? amount : amount.negate());

            Transaction tx = Transaction.builder()
                    .type(type)
                    .amount(amount)
                    .balanceAfter(balanceAfter.max(BigDecimal.valueOf(500)))
                    .description(descs[rng.nextInt(descs.length)])
                    .category(categories[rng.nextInt(categories.length)])
                    .counterpartyAccount(type == Transaction.TransactionType.TRANSFER_OUT
                            ? secondary.getAccountNumber() : null)
                    .status(Transaction.TransactionStatus.COMPLETED)
                    .createdAt(LocalDateTime.now().minusDays(rng.nextInt(60)).minusHours(rng.nextInt(24)))
                    .account(primary)
                    .build();
            transactionRepository.save(tx);
        }
    }
}
