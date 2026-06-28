import pandas as pd
import json

def audit_laporan_bulanan():
    print("=== AUDIT: LAPORAN BULANAN SIMPAN PINJAM (MEI 2026) ===")
    file_path = "docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx"
    
    try:
        df = pd.read_excel(file_path, sheet_name="MEI 2026", header=None, skiprows=3)
    except Exception as e:
        print("Error reading excel:", e)
        return

    discrepancies = []
    
    for index, row in df.iterrows():
        try:
            no = row[0]
            nama = row[1]
            if pd.isna(no) or pd.isna(nama) or str(nama).strip() == "" or str(no).strip().lower() == 'jumlah':
                # Skip summary rows for now
                continue
                
            # Savings calculations
            tab_wajib = float(row[7]) if pd.notna(row[7]) else 0
            s_awal_wajib = float(row[10]) if pd.notna(row[10]) else 0
            wd_wajib = float(row[11]) if pd.notna(row[11]) else 0
            s_akhir_wajib = float(row[12]) if pd.notna(row[12]) else 0
            
            calculated_akhir_wajib = s_awal_wajib + tab_wajib - wd_wajib
            if abs(calculated_akhir_wajib - s_akhir_wajib) > 1:
                discrepancies.append({
                    "no": no,
                    "nama": nama,
                    "type": "Tabungan Wajib",
                    "awal": s_awal_wajib,
                    "setor": tab_wajib,
                    "ambil": wd_wajib,
                    "akhir_tercatat": s_akhir_wajib,
                    "akhir_dihitung": calculated_akhir_wajib,
                    "selisih": s_akhir_wajib - calculated_akhir_wajib
                })
                
            tab_sukarela = float(row[8]) if pd.notna(row[8]) else 0
            s_awal_sukarela = float(row[13]) if pd.notna(row[13]) else 0
            wd_sukarela = float(row[14]) if pd.notna(row[14]) else 0
            s_akhir_sukarela = float(row[15]) if pd.notna(row[15]) else 0
            
            calculated_akhir_sukarela = s_awal_sukarela + tab_sukarela - wd_sukarela
            if abs(calculated_akhir_sukarela - s_akhir_sukarela) > 1:
                discrepancies.append({
                    "no": no,
                    "nama": nama,
                    "type": "Tabungan Sukarela",
                    "awal": s_awal_sukarela,
                    "setor": tab_sukarela,
                    "ambil": wd_sukarela,
                    "akhir_tercatat": s_akhir_sukarela,
                    "akhir_dihitung": calculated_akhir_sukarela,
                    "selisih": s_akhir_sukarela - calculated_akhir_sukarela
                })
                
            # Loan calculations
            s_awal_hutang = float(row[2]) if pd.notna(row[2]) else 0
            angsuran = float(row[3]) if pd.notna(row[3]) else 0
            pinjaman_baru = float(row[16]) if pd.notna(row[16]) else 0
            s_akhir_hutang = float(row[19]) if pd.notna(row[19]) else 0
            
            calculated_akhir_hutang = s_awal_hutang - angsuran + pinjaman_baru
            if abs(calculated_akhir_hutang - s_akhir_hutang) > 1:
                discrepancies.append({
                    "no": no,
                    "nama": nama,
                    "type": "Pinjaman",
                    "awal": s_awal_hutang,
                    "bayar": angsuran,
                    "tambah": pinjaman_baru,
                    "akhir_tercatat": s_akhir_hutang,
                    "akhir_dihitung": calculated_akhir_hutang,
                    "selisih": s_akhir_hutang - calculated_akhir_hutang
                })
                
            
        except Exception as e:
            pass
            
    print(f"Audit completed. Found {len(discrepancies)} discrepancies in Tabungan & Pinjaman.")
    for d in discrepancies[:20]: # Print top 20
        if d['type'] == 'Pinjaman':
            print(f"- {d['nama']} ({d['type']}): Awal={d['awal']}, Bayar={d['bayar']}, Tambah={d['tambah']} -> Tercatat={d['akhir_tercatat']}, Dihitung={d['akhir_dihitung']} (Selisih: {d['selisih']})")
        else:
            print(f"- {d['nama']} ({d['type']}): Awal={d['awal']}, Setor={d['setor']}, Ambil={d['ambil']} -> Tercatat={d['akhir_tercatat']}, Dihitung={d['akhir_dihitung']} (Selisih: {d['selisih']})")
    
    with open("docs/audit_report.json", "w") as f:
        json.dump(discrepancies, f, indent=2)

if __name__ == "__main__":
    audit_laporan_bulanan()
