
import {
    createPublicClient,
    http,
    formatEther,
    isAddress,
    getAddress
} from 'viem';

import { mainnet } from 'viem/chains';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

// 1. Membuat koneksi ke Ethereum Mainnet
const client = createPublicClient({
    chain: mainnet,
    transport: http()
});

// 2. Membuat interface input terminal
const rl = createInterface({
    input: stdin,
    output: stdout
});

// 3. Menentukan struktur data hasil pemeriksaan
type WalletResult = {
    Address: string;
    Balance: string;
    Status: string;
};

// 4. Fungsi utama aplikasi
async function main() {
    console.log('========================================');
    console.log('       ETHEREUM WALLET CHECKER');
    console.log('========================================');

    const addresses: string[] = [];

    try {
        console.log('\nEnter wallet addresses one by one.');
        console.log('Type "done" to start checking.\n');

        // 5. Mengumpulkan alamat wallet dari pengguna
        while (true) {
            const input = await rl.question(
                `Wallet ${addresses.length + 1}: `
            );

            const address = input.trim();

            if (address.toLowerCase() === 'done') {
                break;
            }

            if (address === '') {
                console.log('Input cannot be empty!\n');
                continue;
            }

            addresses.push(address);
        }

        // 6. Memeriksa apakah ada alamat yang dimasukkan
        if (addresses.length === 0) {
            console.log('\nNo wallet addresses entered.');
            return;
        }

        console.log('\nChecking wallet balances...\n');

        // 7. Menyiapkan tempat penyimpanan hasil
        const results: WalletResult[] = [];

        // 8. Memeriksa saldo setiap wallet
        for (const address of addresses) {
            try {
                // Validasi alamat Ethereum
                if (!isAddress(address)) {
                    results.push({
                        Address: address,
                        Balance: '-',
                        Status: 'Invalid Address'
                    });

                    continue;
                }

                // Mengubah alamat ke format checksum
                const checksumAddress = getAddress(address);

                // Mengambil saldo wallet dari Ethereum
                const balance = await client.getBalance({
                    address: checksumAddress
                });

                // Mengubah satuan Wei menjadi ETH
                const ethBalance = formatEther(balance);

                // Menyimpan hasil pemeriksaan
                results.push({
                    Address: checksumAddress,
                    Balance: `${ethBalance} ETH`,
                    Status: 'Success'
                });

            } catch (error) {
                console.error(`Failed to check ${address}:`, error);

                results.push({
                    Address: address,
                    Balance: '-',
                    Status: 'Failed'
                });
            }
        }

        // 9. Menampilkan hasil dalam bentuk tabel
        console.log('========================================');
        console.log('             WALLET RESULTS');
        console.log('========================================');

        console.table(results);

        console.log(`Total wallets checked: ${addresses.length}`);
        console.log('========================================');

    } catch (error) {
        console.error('Application error:', error);

    } finally {
        // 10. Menutup interface terminal
        rl.close();
    }
}

// 11. Menjalankan aplikasi
main();
